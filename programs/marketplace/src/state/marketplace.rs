pub struct Listing {
    pub id: u64,
    pub seller: Pubkey,
    pub nft_mint: Pubkey,
    pub price: u64,
    pub is_active: bool,
}

pub struct Marketplace {
    pub listings: Vec<Listing>,
}

impl Marketplace {
    pub fn new() -> Self {
        Marketplace {
            listings: Vec::new(),
        }
    }

    pub fn add_listing(&mut self, listing: Listing) {
        self.listings.push(listing);
    }

    pub fn cancel_listing(&mut self, listing_id: u64) {
        if let Some(listing) = self.listings.iter_mut().find(|l| l.id == listing_id) {
            listing.is_active = false;
        }
    }

    pub fn buy_nft(&mut self, listing_id: u64) -> Option<&Listing> {
        if let Some(listing) = self.listings.iter_mut().find(|l| l.id == listing_id && l.is_active) {
            listing.is_active = false;
            return Some(listing);
        }
        None
    }
}