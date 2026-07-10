use anchor_lang::prelude::*;

#[error_code]
pub enum PollError {
    #[msg("Invalid poll duration")]
    InvalidPollDuration,

    #[msg("Invalid result visible duration")]
    InvalidResultVisibleDuration,

    #[msg("Invalid title")]
    InvalidTitle,

    #[msg("Invalid description")]
    InvalidDescription,

    #[msg("Custom error message")]
    CustomError,
}
