use anchor_lang::prelude::*;

use crate::constants::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializePoll<'info> {
    #[account(init, payer = poll_worker, space = ANCHOR_DISCRIMINATOR_SIZE + Poll::INIT_SPACE)]
    pub poll: Account<'info, Poll>,

    #[account(mut)]
    pub poll_worker: Signer<'info>,

    pub system_program: Program<'info, System>,
}
