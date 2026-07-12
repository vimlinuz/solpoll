pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("FQC1y8nNHPZqYtc7aTJ7rRkRwVqZdtevjg1dHCEKiB6x");

#[program]
pub mod solpoll {

    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        poll_id: u64,
        title: String,
        description: String,
        start_time: u64,
        end_time: u64,
    ) -> Result<()> {
        initialize_poll::handle_poll_initialization(
            ctx,
            poll_id,
            title,
            description,
            start_time,
            end_time,
        )
    }

    pub fn cast_vote(ctx: Context<Vote>, poll_id: u64, vote_type: VoteType) -> Result<()> {
        cast_vote::handle_vote_casting(ctx, poll_id, vote_type)
    }

    pub fn close_poll(ctx: Context<ClosePoll>, poll_id: u64) -> Result<()> {
        close_poll::handle_poll_closing(ctx, poll_id)
    }
}
