import chalk from "chalk";
import { toConsole } from "./utils/log.js";
import getMs from "./utils/interval-value.js";
import { INTERVAL, STORE_INTERVALS, SUPPORTED_PROXY_DOMAINS, TIME_BETWEEN_CHECKS } from "./main.js";
import fs from "fs";
import path from "path";
import { parse } from 'csv';
import Item from "./item.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default class Store {
	constructor(name, storeFunction) {
		this.name = name;
		this.items = [];
		this.bad_proxies = new Set();
		this.supports_proxies = SUPPORTED_PROXY_DOMAINS.includes(name);
		this.store_function = storeFunction;
		this.interval = getMs(STORE_INTERVALS[name] ? STORE_INTERVALS[name] : INTERVAL);
		this.delay = getMs(TIME_BETWEEN_CHECKS);
	}

	/*
		Adds an Item to the array
	*/
	addItem(item) {
		this.items.push(item);
	}

	/*
		Starts checking status of items
	*/
	startMonitor() {
		const __dirname = path.resolve();
		const csvInputFilePath = path.join(__dirname, "manage_items.csv");
		const csvOutputFilePath = path.join(__dirname, "manage_items-CHECKRESULT.csv");

		var writerStream = fs.createWriteStream(csvOutputFilePath);
		writerStream.on("error", (err) => {
			toConsole("error", `${err.message}`);
		});
		writerStream.on("finish", () => {
			toConsole("info", "Done!");
		});

		let line = 0;
		const parser = parse({delimiter: ','});
		parser.on("readable", () => {
			let row;
			while (row = parser.read()) {
				if (line == 0) {
					writerStream.write(row + "\r\n");
				} else {
					row = row.toString().trim();
					if (row.length >= 10 && row.substr(row.length - 10, 2) == "B0") {
						let asin = row.substr(row.length - 10, 10);
						////this.addItem(new Item("https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=" + asin, row));
						this.addItem(new Item("https://www.amazon.com/dp/" + asin, row)); //// sold by amazon.com
					} else if (row.length >= 10 && row.substr(row.length - 10, 1) == "1") {
						let itemid = row.substr(row.length - 10, 10);
						this.addItem(new Item("https://www.walmart.com/ip/" + itemid, row));
					} else {
						writerStream.write(row + "\r\n");
					}
				}
				line += 1;
			}
		});
		parser.on("error", (err) => {
			toConsole("error", `${err.message}`);
		});
		parser.on("end", () => {
			toConsole("info", `Total: ${line - 1}, Item: ${this.items.length}`);
			if (this.items.length == 0) {
				toConsole("error", "Cannot start montior: no items added!");
				return;
			}
	
			toConsole("setup", "Starting monitor for: " + chalk.cyan.bold(this.name.toUpperCase()));
			this.monitorItems(writerStream);
		});
		fs.createReadStream(csvInputFilePath).pipe(parser);
	}

	/*
		Recursively checks all items 
	*/
	async monitorItems(writerStream) {
		const length = this.items.length;
		let count = 0;
		while (count < length) {
			for (const [index, item] of this.items.entries()) {
				////if (!((item.info.inventory == false && item.info.title) || (item.info.inventory == true && item.info.price))) {
				if (!(item.info.inventory == false || item.info.price)) {
					if (item.info.title)
						toConsole(
							"check",
							"Checking " +
								chalk.magenta.bold(item.info.title) +
								" at " +
								chalk.cyan.bold(this.name.toUpperCase())
						);
					//else toConsole("check", "Checking url: " + chalk.magenta(item.url));
					else toConsole("check", "Checking url: " + item.url);

					// Get Item Page
					const response = await item.getPage(this.name, this.supports_proxies, this.bad_proxies);
					if (response.status == "retry") {
						this.bad_proxies = response.bad_proxies;
					} else if (response.status == "error") {
						if (index != length - 1) await sleep(this.delay);
						continue;
					}

					// Extract item information from the page
					if (!(await item.extractInformation(this.name, this.store_function))) {
						if (index != length - 1) await sleep(this.delay);
						continue;
					} else {
						// Send notifications about the item
						/*if (item.info.inventory && item.notificationSent) {
							toConsole(
								"info",
								chalk.magenta.bold(item.info.title) +
									" is still in stock at " +
									chalk.cyan.bold(this.name.toUpperCase())
							);
						}
						if (item.shouldSendNotification && !item.notificationSent) {
							sendAlerts(item.url, item.info.title, item.info.image, this.name);
							toConsole(
								"stock",
								chalk.magenta.bold(item.info.title) +
									" is in stock at " +
									chalk.cyan.bold(this.name.toUpperCase()) +
									"!!"
							);
							item.notificationSent = true;
						}*/
						if (this.name == "amazon") {
							////if (item.info.inventory == false && item.info.title) {
							if (item.info.inventory == false) {
								count += 1;
								let str = item.row;
								////let tip = item.info.title;
								let tip = "Sold by amazon.com"; //// sold by amazon.com
								toConsole(
									"info",
									tip
								);
								str = str + "," + tip;
								str = str + "\r\n";
								writerStream.write(str);
							} else if (item.info.inventory == true && item.info.price) {
								count += 1;
								let str = item.row;
								if (item.info.price) {
									let strPrice = item.info.price.toString().substr(1);
									toConsole(
										"info",
										strPrice
									);
									str = str + "," + strPrice;
								}
								if (item.info.title) {
									let strTitle = item.info.title.toString();
									str = str + "," + '"' + strTitle + '"';
								}
								str = str + "\r\n";
								writerStream.write(str);
							}
						} else if (this.name == "walmart") {
							if ((item.info.inventory == false && item.info.title) || (item.info.inventory == true && item.info.price)) {
								count += 1;
								let str = item.row;
								if (item.info.price) {
									let strPrice = item.info.price.toString();
									if (strPrice.substring(0, 1) == "$") {
										strPrice = strPrice.substr(1);
									}
									toConsole(
										"info",
										strPrice
									);
									str = str + "," + strPrice;
								}
								if (item.info.inventory == false) {
									let tip = item.info.title;
									toConsole(
										"info",
										tip
									);
									str = str + "," + tip;
								}
								str = str + "\r\n";
								writerStream.write(str);
							}
						}
					}

					if (index != length - 1) await sleep(this.delay);
				}
			}
		}

		writerStream.end();

		/*toConsole(
			"info",
			"Waiting " +
				chalk.yellow.bold(
					STORE_INTERVALS[this.name]
						? STORE_INTERVALS[this.name].value + " " + STORE_INTERVALS[this.name].unit
						: INTERVAL.value + " " + INTERVAL.unit
				) +
				" to check " +
				chalk.cyan.bold(this.name.toUpperCase()) +
				" again"
		);

		setTimeout(this.monitorItems.bind(this), this.interval);*/
	}
}
