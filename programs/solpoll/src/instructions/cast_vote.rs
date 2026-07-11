use anchor_lang::prelude::*;

use crate::{VoterState, state::{Poll, VoteType}};

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
    pub voter_has_voted: Account<'info, VoterState>,

    pub system_program: Program<'info, System>,
}

pub fn cast_poll(_ctx: Context<Vote>, _poll_id: u64, _vote_type: VoteType) -> Result<()> {
    Ok(())
}
