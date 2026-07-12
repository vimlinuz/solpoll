use anchor_client::anchor_lang::solana_program;
use anchor_client::anchor_lang::solana_program::clock::Clock;
use anchor_client::{
    anchor_lang::{InstructionData, ToAccountMetas},
    Instruction, Signer, VersionedTransaction,
};
use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_message::{Message, VersionedMessage};
use solana_pubkey::Pubkey;
use solpoll::VoteType;

const PROGRAM_PATH: &str = "../target/deploy/solpoll.so";
const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

#[test]
fn test_cast_vote() {
    let program_id = solpoll::id();
    let mut svm = LiteSVM::new();

    let poll_id = 1 as u64;
    let payer = Keypair::new();
    let title = "Test Poll".to_string();
    let description = "Test Poll Description".to_string();

    let clock = svm.get_sysvar::<solana_program::clock::Clock>();
    let start_time = clock.unix_timestamp as u64;
    let end_time = start_time + 100;

    let (poll_pda, _) =
        Pubkey::find_program_address(&[b"poll", poll_id.to_le_bytes().as_ref()], &program_id);

    svm.airdrop(&payer.pubkey(), LAMPORTS_PER_SOL * 10).unwrap();

    svm.add_program_from_file(program_id, PROGRAM_PATH).unwrap();

    let ix = Instruction::new_with_bytes(
        program_id,
        &solpoll::instruction::InitializePoll {
            poll_id: poll_id,
            title: title.clone(),
            description: description.clone(),
            start_time: start_time,
            end_time: end_time,
        }
        .data(),
        solpoll::accounts::InitializePoll {
            payer: payer.pubkey(),
            poll: poll_pda,
            system_program: solana_program::system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[ix], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[payer]).unwrap();
    assert!(svm.send_transaction(tx).is_ok());

    let voter = Keypair::new();

    svm.airdrop(&voter.pubkey(), LAMPORTS_PER_SOL * 10).unwrap();

    // LiteSVM clock doesn't advance automatically (no real validator running).
    // The program checks current_time > poll.start_time, so we manually
    // advance the clock to a value between start_time (0) and end_time (100).
    let mut clock = svm.get_sysvar::<Clock>();
    clock.unix_timestamp = 50;
    svm.set_sysvar(&clock);

    let (voter_state_pda, _) = Pubkey::find_program_address(
        &[
            b"voter",
            voter.pubkey().as_ref(),
            poll_id.to_le_bytes().as_ref(),
        ],
        &program_id,
    );

    let ix = Instruction::new_with_bytes(
        program_id,
        &solpoll::instruction::CastVote {
            poll_id: poll_id,
            vote_type: VoteType::UpVote,
        }
        .data(),
        solpoll::accounts::Vote {
            voter: voter.pubkey(),
            poll: poll_pda,
            voter_state: voter_state_pda,
            system_program: solana_program::system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[ix], Some(&voter.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[voter]).unwrap();
    assert!(svm.send_transaction(tx).is_ok());
}

#[test]
fn test_cast_vote_after_end_time() {
    let program_id = solpoll::id();
    let mut svm = LiteSVM::new();

    let poll_id = 2 as u64;
    let payer = Keypair::new();
    let title = "Test Poll".to_string();
    let description = "Test Poll Description".to_string();

    let clock = svm.get_sysvar::<solana_program::clock::Clock>();
    let start_time = clock.unix_timestamp as u64;
    let end_time = start_time + 100;

    let (poll_pda, _) =
        Pubkey::find_program_address(&[b"poll", poll_id.to_le_bytes().as_ref()], &program_id);

    svm.airdrop(&payer.pubkey(), LAMPORTS_PER_SOL * 10).unwrap();

    svm.add_program_from_file(program_id, PROGRAM_PATH).unwrap();

    let ix = Instruction::new_with_bytes(
        program_id,
        &solpoll::instruction::InitializePoll {
            poll_id: poll_id,
            title: title.clone(),
            description: description.clone(),
            start_time: start_time,
            end_time: end_time,
        }
        .data(),
        solpoll::accounts::InitializePoll {
            payer: payer.pubkey(),
            poll: poll_pda,
            system_program: solana_program::system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[ix], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[payer]).unwrap();
    assert!(svm.send_transaction(tx).is_ok());

    let voter = Keypair::new();

    svm.airdrop(&voter.pubkey(), LAMPORTS_PER_SOL * 10).unwrap();

    // Advance clock past end_time so the program rejects the vote.
    let mut clock = svm.get_sysvar::<Clock>();
    clock.unix_timestamp = 200;
    svm.set_sysvar(&clock);

    let (voter_state_pda, _) = Pubkey::find_program_address(
        &[
            b"voter",
            voter.pubkey().as_ref(),
            poll_id.to_le_bytes().as_ref(),
        ],
        &program_id,
    );

    let ix = Instruction::new_with_bytes(
        program_id,
        &solpoll::instruction::CastVote {
            poll_id: poll_id,
            vote_type: VoteType::UpVote,
        }
        .data(),
        solpoll::accounts::Vote {
            voter: voter.pubkey(),
            poll: poll_pda,
            voter_state: voter_state_pda,
            system_program: solana_program::system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[ix], Some(&voter.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[voter]).unwrap();
    assert!(svm.send_transaction(tx).is_err());
}
