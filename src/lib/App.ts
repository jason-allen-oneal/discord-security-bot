// src/lib/App.ts

import axios from 'axios'; // make sure this is installed
import Request from './Request.js';
import DiscordWrapper from './DiscordWrapper.js';
import { ChatInputCommandInteraction } from 'discord.js';

export default class App {
    static async getImage(interaction: ChatInputCommandInteraction, category: string) {
        await interaction.deferReply();

        const response = await Request.get(category);

        if (response) {
            const result = await response.data;
            const data = result.results.posts;

            const randItem = Math.floor(Math.random() * data.length);
            const { title, image_url } = data[randItem];

            try {
                // Download image as buffer
                const imgResponse = await axios.get(image_url, {
                    responseType: 'arraybuffer'
                });

                const buffer = Buffer.from(imgResponse.data, 'binary');

                return DiscordWrapper.sendWithAttachment(
                    title,
                    interaction,
                    "Here's your image:",
                    buffer,
                    'image.jpg'
                );
            } catch (err) {
                console.error("Image download failed", err);
                return DiscordWrapper.sendError(interaction, "Failed to download image");
            }
        } else {
            return DiscordWrapper.sendError(interaction, "Could not get image");
        }
    }
}
