use anchor_lang::prelude::*;

use crate::error::PollError;
use crate::state::Poll;
use crate::state::PollState;

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct ClosePoll<'info> {
    #[account(mut)]
    pub closer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"poll", poll_id.to_le_bytes().as_ref()] ,
        bump = poll.bump,
    )]
    pub poll: Account<'info, Poll>,

    system_program: Program<'info, System>,
}

pub fn handle_poll_closing(ctx: Context<ClosePoll>, poll_id: u64) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    let current_time = Clock::get()?.unix_timestamp as u64;

    require!(poll.state == PollState::Active, PollError::InactivePoll);
    require!(current_time > poll.end_time, PollError::PollNotEnded);
    require!(current_time < poll.start_time, PollError::PollNotStarted);

    poll.state = PollState::Closed;

    msg!(
        "Poll {} has been closed by {}",
        poll_id,
        ctx.accounts.closer.key()
    );

    Ok(())
}
