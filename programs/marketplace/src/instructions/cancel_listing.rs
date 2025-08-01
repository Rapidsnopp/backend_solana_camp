// This file defines the instruction for canceling an existing NFT listing.
// It includes the logic for handling the cancellation.

use anchor_lang::prelude::*;
use crate::state::Marketplace;

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(mut, has_one = seller)]
    pub listing: Box<Account<'info, Marketplace>>,
}

pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
    let listing = &mut ctx.accounts.listing;

    // Ensure the listing is active
    if listing.is_active {
        // Mark the listing as canceled
        listing.is_active = false;
        Ok(())
    } else {
        Err(ErrorCode::ListingNotActive.into())
    }
}

#[error]
pub enum ErrorCode {
    #[msg("The listing is not active.")]
    ListingNotActive,
}