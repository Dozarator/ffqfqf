const { Telegraf } = require('telegraf');
const fetch = require('node-fetch'); // Используем простой require без .default
const cheerio = require('cheerio');

const bot = new Telegraf("6883027495:AAGi4v-eyoBxlBX2BKHccpWvHPP7hhxhjfw");

let cars = [];
let curCar = [];

async function searchCars(brand, chatId) {
    try {
        const url = `https://carapi.example.com/search?brand=${brand}`; // Обратите внимание на обратные кавычки здесь
        const response = await fetch(url);
        const data = await response.json();
        cars = data.items;
        curCar = cars.slice(0, 1);
        const message = getCarMessage(curCar);

        bot.telegram.sendMessage(chatId, message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Еще машины', callback_data: 'more_cars' }],
                    [{ text: 'Другая машина', callback_data: 'other_car' }]
                ]
            }
        });
    } catch (error) {
        bot.telegram.sendMessage(chatId, 'Ошибка при выполнении запроса');
    }
}

function getCarMessage(cars) {
    let message = '';
    cars.forEach((car, index) => {
        message +=` Машина ${index + 1}:\nМарка: ${car.brand}\nМодель: ${car.model}\nГод выпуска: ${car.year}\nЦена: ${car.price}\n\n`;
    });
    return message;
}

bot.action('other_car', ctx => {
    cars = [];
    curCar = [];
    ctx.reply('Введите марку машины для поиска:');
});

bot.command('start', ctx => {
    const chatId = ctx.chat.id;
    ctx.reply('Привет! Введите марку машины для поиска:');
});

bot.on('text', ctx => {
    const chatId = ctx.chat.id;
    const brand = ctx.message.text;

    searchCars(brand, chatId);
});

bot.action('more_cars', ctx => {
    curCar = cars.slice(curCar.length, curCar.length + 1);
    const message = getCarMessage(curCar);

    if (ctx.update.message && message !== ctx.update.message.text) {
        ctx.editMessageText(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Еще машины', callback_data: 'more_cars' }],
                    [{ text: 'Другая машина', callback_data: 'other_car' }]
                ]
            }
        });
    }
});

bot.launch();