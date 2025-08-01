// This file defines the instruction for creating a new NFT listing on the marketplace.
// It includes the logic for handling the creation of listings.

use anchor_lang::prelude::*;
use crate::state::marketplace::{Marketplace, Listing};

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(init, payer = seller, space = Listing::LEN)]
    pub listing: Account<'info, Listing>,
    pub marketplace: Account<'info, Marketplace>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateListingArgs {
    pub nft_mint: Pubkey,
    pub price: u64,
}

pub fn handler(ctx: Context<CreateListing>, args: CreateListingArgs) -> Result<()> {
    let listing = &mut ctx.accounts.listing;
    listing.seller = ctx.accounts.seller.key();
    listing.nft_mint = args.nft_mint;
    listing.price = args.price;
    listing.is_active = true;

    Ok(())
}