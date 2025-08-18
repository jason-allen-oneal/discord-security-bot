// src/lib/DiscordWrapper.ts

import Discord, { ChatInputCommandInteraction } from 'discord.js';
import { config, color } from '../config';

export default class DiscordWrapper {
    static _buildEmbed(title: string, desc: string, msg: any, color: any, image: string | null) {
        const embed = new Discord.EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setFooter({ text: msg.user?.username || msg.author.username, iconURL: msg.user?.displayAvatarURL({ dynamic: true }) || msg.author.displayAvatarURL({ dynamic: true }) })
            .setColor(color)
            .setTimestamp();
        
        if (image) {
            console.log('image', image);
            embed.setImage(image);
        }

        // Handle both interactions and messages
        if (msg.reply && !msg.deferred) {
            return msg.reply({ embeds: [embed] });
        } else if (msg.editReply || msg.deferred) {
            return msg.editReply({ embeds: [embed] });
        }        

        return;
    }

    static sendError(msg: any, err: string) {
        DiscordWrapper._buildEmbed("Error!", "An error occurred: " + err, msg, 'Red', null);
    }

    static sendReply(title: string, msg: any, content: string, image: string | null = null) {
        return DiscordWrapper._buildEmbed(title, content, msg, color, image);
    }

    static async sendWithAttachment(title: string, msg: ChatInputCommandInteraction, desc: string, buffer: Buffer, filename: string) {
        const embed = new Discord.EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setImage(`attachment://${filename}`)
            .setFooter({
                text: msg.user.displayName || msg.user.username,
                iconURL: msg.user.displayAvatarURL()
            })
            .setColor(color)
            .setTimestamp();
    
        const file = new Discord.AttachmentBuilder(buffer, { name: filename });
    
        if (msg.reply && !msg.deferred) {
            return msg.reply({ embeds: [embed], files: [file] });
        } else if (msg.editReply || msg.deferred) {
            return msg.editReply({ embeds: [embed], files: [file] });
        }
    
        return;
    }    
}
