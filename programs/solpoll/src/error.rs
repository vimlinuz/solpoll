use anchor_lang::prelude::*;

#[error_code]
pub enum PollError {
    #[msg("Invalid poll duration")]
    InvalidPollDuration,

    #[msg("Poll haven't started yet")]
    PollNotStarted,

    #[msg("Poll have already endend")]
    PollAlreadyEnded,

    #[msg("Poll is inactive")]
    InactivePoll,

    #[msg("Already voted")]
    AlreadyVoted,

    #[msg("Invalid result visible duration")]
    InvalidResultVisibleDuration,

    #[msg("Invalid title")]
    InvalidTitle,

    #[msg("Invalid description")]
    InvalidDescription,

    #[msg("Custom error message")]
    CustomError,
}
