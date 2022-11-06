import cheerio from "cheerio";

export default function walmart(html) {
	try {
		const SCRIPT_SELECTOR = "#__NEXT_DATA__";
		const TITLE_SELECTOR = '.lh-copy[itemprop = "name"]';
		const IMAGE_SELECTOR = ".self-center > img";
		const IMAGE_SELECTOR_BACKUP = 'li[data-slide="0"] img';
		const INVENTORY_SELECTOR =
			'div[data-testid="add-to-cart-section"] span[style="visibility:visible"]';
		const INVENTORY_SELECTOR_UNAVAILABLE = 'div.b.gray.pr3:first';
		const BUTTON_SELECTOR_MORESELLER = 'button[aria-label="Compare all sellers"]';
		const SELLER_SELECTOR = 'a[data-testid="seller-name-link"]';
		const PRICE_SELECTOR = 'div[data-testid="add-to-cart-section"] span[itemprop="price"]';
		const PROMOTION_SELECTOR = "span.w_Fm.w_Fs.w_Fv.mt2.mr2:first";
		const PROMOTION_SELECTOR2 = "span.w_Fi.w_Fo.w_Fr.mt2.mr2:first";

		const $ = cheerio.load(html);
		//let title, image, seller, inventory;
		let title = undefined;
		let inventory = undefined;
		let price = undefined;

		// Script method
		/*const script = $(SCRIPT_SELECTOR).html()?.trim();
		const product_info = script
			? JSON.parse(script).props?.pageProps?.initialData?.data?.product
			: undefined;
		if (product_info) {
			title = product_info.name;
			image = product_info.imageInfo?.thumbnailUrl;
			seller = product_info?.sellerName;
			inventory = product_info.availabilityStatus == "IN_STOCK" && seller == "Walmart.com";
		}

		// HTML method
		else {
			title = $(TITLE_SELECTOR).text()?.trim();
			image = $(IMAGE_SELECTOR).attr("src");
			if (!image) {
				image = $(IMAGE_SELECTOR_BACKUP).attr("src");
			}
			seller = $(SELLER_SELECTOR).text()?.trim();
			inventory = $(INVENTORY_SELECTOR).text()?.trim();
			inventory = inventory == "Add to cart" && seller == "";
		}*/
		if (html == "404") {
			inventory = false;
			title = "Not found";
		} else {
			let button = $(BUTTON_SELECTOR_MORESELLER).text()?.trim();
			if (button == "Compare all sellers") {
				inventory = false;
				title = "More seller";
			} else {
				inventory = $(INVENTORY_SELECTOR_UNAVAILABLE).text()?.trim();
				if (inventory == "Out of stock") {
					inventory = false;
					title = "Out of stock";
				} else {
					inventory = true;
				}
				price = $(PRICE_SELECTOR).text()?.trim();
				if (price.toString().length > 3 && price.toString().substring(0, 3) == "Now") {
					let promotion = $(PROMOTION_SELECTOR).text()?.trim();
					if (!promotion) {
						promotion = $(PROMOTION_SELECTOR2).text()?.trim();
					}
					if (promotion == "Reduced price") {
						price = "Red" + price.toString().substring(3);
					} else if (promotion == "Clearance") {
						price = "Cle" + price.toString().substring(3);
					}
				}
			}
		}

		//return { title, image, inventory };
		return { inventory, title, price };
	} catch (error) {
		return { error };
	}
}
