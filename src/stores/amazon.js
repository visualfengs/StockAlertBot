import cheerio from "cheerio";

export default function amazon(html) {
	try {
		//const TITLE_SELECTOR = "#productTitle";
		const TITLE_SELECTOR = "span.sc-product-title:first";
		//const IMAGE_SELECTOR = "#landingImage";
		const IMAGE_SELECTOR = "img.sc-product-image:first";
		const IMAGE_BOOK_SELECTOR = "#img-canvas > img";
		const INVENTORY_SELECTOR = "#add-to-cart-button";
		const INVENTORY_SELECTOR_CARTISEMPTY = "h1.a-spacing-mini.a-spacing-top-base:first";
		const INVENTORY_SELECTOR_UNAVAILABLE = "h5.a-spacing-mini.a-spacing-top-base:first";
		const PRICE_SELECTOR = "span.sc-product-price:first";

		const $ = cheerio.load(html);
		let title = undefined;
		let inventory = undefined;
		let price = undefined;

		/*const title = $(TITLE_SELECTOR).text()?.trim();
		let image = $(IMAGE_SELECTOR).attr("data-old-hires");
		let inventory = $(INVENTORY_SELECTOR).attr("value");
		
		if (!image) {
			image = $(IMAGE_SELECTOR).attr("src");
			if (!image) {
				image = $(IMAGE_BOOK_SELECTOR).attr("src");
			}
		}

		if (inventory != undefined) {
			inventory = true;
		} else if (inventory == undefined) {
			inventory = false;
		}*/
		inventory = $(INVENTORY_SELECTOR_CARTISEMPTY).text()?.trim();
		if (inventory == "Cart is empty") {
			inventory = false;
			let unavailable = $(INVENTORY_SELECTOR_UNAVAILABLE).text()?.trim();
			if (unavailable == "These items are currently unavailable:") {
				title = "Out-of-stock";
			} else {
				title = "Not-found";
			}
		} else {
			inventory = true;
			//title = $(TITLE_SELECTOR).text()?.trim();
			price = $(PRICE_SELECTOR).text()?.trim();
		}

		//return { title, image, inventory };
		return { inventory, title, price };
	} catch (error) {
		return { error };
	}
}
