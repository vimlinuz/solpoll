use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
#[instruction(title: String, description: String)]
pub struct Poll {
    /// Address of the poll
    pub address: Pubkey,

    /// Title of the poll
    #[max_len(32)]
    pub title: String,

    /// Description of the poll
    #[max_len(256)]
    pub description: String,

    /// List of options for the poll
    pub options: VoteType,

    /// List of voters for the poll
    #[max_len(100)]
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

#[derive(InitSpace, Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub struct Voters {
    /// Address of the voter
    pub address: Pubkey,

    /// Vote type of the voter
    pub vote_type: VoteType,
}

#[derive(InitSpace, Clone, Copy, AnchorSerialize, AnchorDeserialize)]
pub enum VoteType {
    UpVote,
    DownVote,
    Abstain,
}
