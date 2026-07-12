use anchor_client::{
    anchor_lang::{self, InstructionData, ToAccountMetas},
    Instruction, Signer, VersionedTransaction,
};
use anchor_lang::solana_program;
use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_message::{Message, VersionedMessage};
use solana_pubkey::Pubkey;

const PROGRAM_PATH: &str = "../target/deploy/solpoll.so";
const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

#[test]
fn test_poll_initialization() {
    let program_id = solpoll::id();
    let mut svm = LiteSVM::new();

    let poll_id = 1 as u64;
    let payer = Keypair::new();
    let title = "Test Poll".to_string();
    let description = "Test Poll Description".to_string();

    let start_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

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
}

#[test]
fn test_poll_initialization_with_invalid_duration() {
    let program_id = solpoll::id();
    let mut svm = LiteSVM::new();

    let poll_id = 2 as u64;
    let payer = Keypair::new();
    let title = "Test Poll Title".to_string();
    let description = "Test poll with invalid duration".to_string();

    let start_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let end_time = start_time - 100;

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
    assert!(svm.send_transaction(tx).is_err());
}
