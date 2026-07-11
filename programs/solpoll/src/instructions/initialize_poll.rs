use anchor_lang::prelude::*;

use crate::constants::*;
use crate::state::*;

use crate::error::PollError;

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = ANCHOR_DISCRIMINATOR_SIZE + Poll::INIT_SPACE,
        seeds = [b"poll", poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub poll: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_poll(
    ctx: Context<InitializePoll>,
    poll_id: u64,
    title: String,
    description: String,
    start_time: u64,
    end_time: u64,
) -> Result<()> {
    let poll = &mut ctx.accounts.poll;

    poll.poll_id = poll_id;

    require!(start_time < end_time, PollError::InvalidPollDuration);

    require!(
        !title.is_empty() && title.len() <= 32,
        PollError::InvalidTitle
    );

    require!(
        !description.is_empty() && description.len() <= 256,
        PollError::InvalidDescription
    );

    poll.title = title;
    poll.description = description;

    poll.start_time = start_time;
    poll.end_time = end_time;

    poll.total_vote = 0;
    poll.total_up_vote = 0;
    poll.total_down_vote = 0;

    poll.bump = ctx.bumps.poll;

    poll.state = PollState::Active;

    msg!("Poll {} initialized successfully", poll_id);

    Ok(())
}
