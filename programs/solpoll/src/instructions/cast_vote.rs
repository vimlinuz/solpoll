use anchor_lang::prelude::*;

use crate::{
    error::PollError,
    state::{Poll, VoteType},
    PollState, VoterState,
};

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct Vote<'info> {
    /// The account of the voter
    #[account(mut)]
    pub voter: Signer<'info>,

    #[account(
        mut,
        seeds = [b"poll", poll_id.to_le_bytes().as_ref()] ,
        bump = poll.bump,
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = voter,
        space = 8 + VoterState::INIT_SPACE,
        seeds = [b"voter", voter.key().as_ref(), poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub voter_state: Account<'info, VoterState>,

    pub system_program: Program<'info, System>,
}

pub fn cast_vote(ctx: Context<Vote>, poll_id: u64, vote_type: VoteType) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    let voter = &mut ctx.accounts.voter_state;

    let current_time = Clock::get()?.unix_timestamp as u64;

    require!(current_time > poll.start_time, PollError::PollNotStarted);
    require!(current_time < poll.end_time, PollError::PollAlreadyEnded);
    require!(poll.state == PollState::Active, PollError::InactivePoll);

    require!(!voter.has_voted, PollError::AlreadyVoted);

    poll.total_vote += 1;

    if vote_type == VoteType::UpVote {
        poll.total_up_vote += 1;
    }

    if vote_type == VoteType::DownVote {
        poll.total_down_vote += 1;
    }

    voter.vote_type = vote_type;
    voter.has_voted = true;
    voter.voted_at = current_time;

    msg!(
        "Voter {} casted vote {} for poll {}",
        ctx.accounts.voter.key(),
        vote_type,
        poll_id
    );

    Ok(())
}
