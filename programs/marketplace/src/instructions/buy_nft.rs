// This file defines the instruction for purchasing an NFT from the marketplace.
// It includes the logic for handling the purchase transaction.

use anchor_lang::prelude::*;
use crate::state::marketplace::{Marketplace, Listing};

#[derive(Accounts)]
pub struct BuyNft<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut, has_one = seller)]
    pub listing: Account<'info, Listing>,
    pub seller: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn buy_nft(ctx: Context<BuyNft>, amount: u64) -> Result<()> {
    let listing = &mut ctx.accounts.listing;

    // Ensure the buyer has enough funds
    if ctx.accounts.buyer.lamports() < amount {
        return Err(ErrorCode::InsufficientFunds.into());
    }

    // Transfer funds from buyer to seller
    **ctx.accounts.buyer.lamports.borrow_mut() -= amount;
    **ctx.accounts.seller.lamports.borrow_mut() += amount;

    // Update the listing status
    listing.is_sold = true;

    Ok(())
}

#[error]
pub enum ErrorCode {
    #[msg("Insufficient funds to complete the purchase.")]
    InsufficientFunds,
}