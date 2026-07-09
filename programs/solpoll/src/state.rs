use anchor_lang::prelude::*;

pub struct Poll {
    /// Address of the poll
    pub address: Pubkey,

    /// Title of the poll
    pub title: String,

    /// Description of the poll
    pub description: String,

    /// List of options for the poll
    pub options: VoteType,

    /// List of voters for the poll
    pub voters: Vec<Voters>,

    /// Start time of the poll
    pub start_time: i64,

    /// End time of the poll
    pub end_time: i64,

    /// Total Up votes for the poll
    pub total_up_vote: u64,

    /// Total Down votes for the poll
    pub total_down_vote: u64,

    /// Total votes for the poll
    pub total_vote: u64,
}

pub struct Voters {
    /// Address of the voter
    pub address: Pubkey,

    /// Vote type of the voter
    pub vote_type: VoteType,
}

pub enum VoteType {
    UpVote,
    DownVote,
    Abstain,
}
