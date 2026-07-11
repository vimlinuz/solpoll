use std::fmt;

use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
#[instruction(title: String, description: String)]
pub struct Poll {
    /// Address of the poll
    pub poll_id: u64,

    /// Title of the poll
    #[max_len(32)]
    pub title: String,

    /// Description of the poll
    #[max_len(256)]
    pub description: String,

    /// Start time of the poll
    pub start_time: u64,

    /// End time of the poll
    pub end_time: u64,

    /// Total Up votes for the poll
    pub total_up_vote: u64,

    /// Total Down votes for the poll
    pub total_down_vote: u64,

    /// Total votes for the poll
    pub total_vote: u64,

    /// Bump seed for the poll
    pub bump: u8,

    /// State of the poll
    pub state: PollState,
}

#[derive(InitSpace, Clone, Copy, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum VoteType {
    UpVote,
    DownVote,
    Abstain,
}

impl fmt::Display for VoteType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            VoteType::UpVote => write!(f, "UpVote"),
            VoteType::DownVote => write!(f, "DownVote"),
            VoteType::Abstain => write!(f, "Abstain"),
        }
    }
}

#[derive(InitSpace, Clone, Copy, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum PollState {
    /// Poll is active and can be voted on
    Active,

    /// Poll is closed and no more votes can be cast
    Closed,

    /// Poll is closed and results are being displayed
    DisplayingResults,
}

#[account]
#[derive(InitSpace)]
pub struct VoterState {
    /// Type of the vote
    pub vote_type: VoteType,

    pub has_voted: bool,

    /// Timestamp of the vote
    pub voted_at: u64,
}
