// commands/tools.ts

import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    ChannelType,
} from "discord.js";
import { exec } from "child_process";
import { createHash } from "crypto";

const data = new SlashCommandBuilder()
    .setName("tools")
    .setDescription("Useful cybersecurity utilities.")
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("hash")
            .setDescription("Generate a hash for the given input.")
            .addStringOption(opt =>
                opt.setName("text")
                    .setDescription("Text to hash")
                    .setRequired(true)
            )
            .addStringOption(opt =>
                opt.setName("algorithm")
                    .setDescription("Hash algorithm")
                    .setRequired(true)
                    .addChoices(
                        { name: "md5", value: "md5" },
                        { name: "sha1", value: "sha1" },
                        { name: "sha256", value: "sha256" },
                        { name: "sha512", value: "sha512" }
                    )
            )
    )
    .addSubcommand(sub =>
        sub
            .setName("scan-server")
            .setDescription("Run an Nmap scan on a server.")
            .addStringOption(opt =>
                opt.setName("target")
                    .setDescription("IP or hostname to scan")
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub
            .setName("scan-site")
            .setDescription("Run a Nikto scan on a website.")
            .addStringOption(opt =>
                opt.setName("target")
                    .setDescription("URL or hostname to scan (e.g. http://example.com)")
                    .setRequired(true)
            )
    );

export { data };

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (interaction.channel?.type === ChannelType.DM) {
        return interaction.reply({
            content: "❌ This command cannot be used in DMs.",
            ephemeral: true,
        });
    }

    if (subcommand === "hash") {
        const text = interaction.options.getString("text", true);
        const algorithm = interaction.options.getString("algorithm", true);

        try {
            const hashed = createHash(algorithm).update(text).digest("hex");
            return interaction.reply(`🔒 \`${algorithm.toUpperCase()} hash:\` ${hashed}`);
        } catch (e: any) {
            return interaction.reply(`❌ Error creating hash: ${e.message}`);
        }
    }

    const target = interaction.options.getString("target", true);
    await interaction.deferReply();

    let command = "";
    if (subcommand === "scan-server") {
        command = `nmap -A ${target}`;
    } else if (subcommand === "scan-site") {
        command = `nikto.pl -h "${target}"`;
    }

    exec(command, async (error, stdout, stderr) => {
        if (error) {
            await interaction.editReply(`❌ Command error: ${error.message}`);
            return;
        }

        if (stderr && !stdout.trim()) {
            await interaction.editReply(`⚠️ Stderr: ${stderr}`);
            return;
        }

        const output = stdout.length > 1900
            ? stdout.substring(0, 1900) + "\n...[truncated]"
            : stdout;

        await interaction.editReply(`📋 Scan result:\n\`\`\`\n${output}\n\`\`\``);
    });
}
