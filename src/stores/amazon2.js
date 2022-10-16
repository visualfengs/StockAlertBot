import cheerio from "cheerio";

export default function amazon(html) {
	try {
		//const TITLE_SELECTOR = "#productTitle";
		const TITLE_SELECTOR = "span.sc-product-title:first";
		//const IMAGE_SELECTOR = "#landingImage";
		const IMAGE_SELECTOR = "img.sc-product-image:first";
		const IMAGE_BOOK_SELECTOR = "#img-canvas > img";
		//const INVENTORY_SELECTOR = "#add-to-cart-button";
		const INVENTORY_SELECTOR = "h5.a-spacing-mini.a-spacing-top-base:first";
		const PRICE_SELECTOR = "span.sc-product-price:first";

		////const $ = cheerio.load(html);
		//const title = $(TITLE_SELECTOR).text()?.trim();
		let title = undefined;
		//let image = $(IMAGE_SELECTOR).attr("data-old-hires");
		//let inventory = $(INVENTORY_SELECTOR).attr("value");
		////let inventory = $(INVENTORY_SELECTOR).text()?.trim();
		let inventory = html.indexOf('<span class="a-size-small a-color-secondary"> Ships from and sold by Amazon.com </span>') == -1; //// sold by amazon.com
		let price = undefined;

		/*if (!image) {
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
		////
		/*if (inventory == "These items are currently unavailable:") {
			inventory = false;
		} else {
			inventory = true;
			title = $(TITLE_SELECTOR).text()?.trim();
			price = $(PRICE_SELECTOR).text()?.trim();
		}*/

		//return { title, image, inventory };
		return { inventory, title, price };
	} catch (error) {
		return { error };
	}
}
