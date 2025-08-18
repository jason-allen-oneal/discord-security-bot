import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import { exec } from "child_process";
import { resolve } from "dns";
import { promisify } from "util";
import fetch from 'node-fetch';

const asyncResolve = promisify(resolve);

const data = new SlashCommandBuilder()
    .setName("recon")
    .setDescription("Run recon and intelligence gathering tools.")
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("whois")
            .setDescription("Lookup WHOIS information for a domain or IP.")
            .addStringOption(opt =>
                opt.setName("target")
                    .setDescription("Domain or IP address")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("dns")
            .setDescription("Query DNS records for a domain.")
            .addStringOption(opt =>
                opt.setName("domain")
                    .setDescription("Domain to query")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("subdomains")
            .setDescription("Find subdomains for a domain.")
            .addStringOption(opt =>
                opt.setName("domain")
                    .setDescription("Domain to enumerate")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("osint")
            .setDescription("Run a basic OSINT scan.")
            .addStringOption(opt =>
                opt.setName("target")
                    .setDescription("Target identifier (username, email, etc.)")
                    .setRequired(true)
            )
    );

export { data };

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply();

    switch (subcommand) {
        case "whois": {
            const target = interaction.options.getString("target", true);
            exec(`whois ${target}`, async (err, stdout, stderr) => {
                if (err) {
                    return interaction.editReply(`❌ WHOIS failed: ${err.message}`);
                }
                const result = stdout.slice(0, 1900); // Discord limit
                return interaction.editReply(`🔍 WHOIS for \`${target}\`:\n\`\`\`\n${result}\n\`\`\``);
            });
            break;
        }

        case "dns": {
            const domain = interaction.options.getString("domain", true);
            try {
                const addresses = await asyncResolve(domain);
                return interaction.editReply(`📡 DNS A records for \`${domain}\`:\n\`\`\`\n${addresses.join("\n")}\n\`\`\``);
            } catch (e: any) {
                return interaction.editReply(`❌ DNS lookup failed: ${e.message}`);
            }
        }

        case "subdomains": {
            const domain = interaction.options.getString("domain", true);
            const url = `https://api.hackertarget.com/hostsearch/?q=${domain}`;
            try {
                const res = await fetch(url);
                const text = await res.text();
                if (!text || text.includes("error")) {
                    return interaction.editReply(`❌ No subdomains found or API error.`);
                }
                const lines = text.trim().split("\n").slice(0, 50); // Limit output
                return interaction.editReply(`🌐 Subdomains for \`${domain}\`:\n\`\`\`\n${lines.join("\n")}\n\`\`\``);
            } catch (e: any) {
                return interaction.editReply(`❌ Subdomain lookup failed: ${e.message}`);
            }
        }

        case "osint": {
            const target = interaction.options.getString("target", true);
            const isEmail = target.includes('@');
            const isUsername = !isEmail;
        
            if (isEmail) {
                // Use Hunter.io Email Finder API
                const hunterUrl = `https://api.hunter.io/v2/email-finder?domain=example.com&first_name=John&last_name=Doe&api_key=YOUR_API_KEY`;
                try {
                    const res = await fetch(hunterUrl);
                    const data = await res.json() as any;
                    if (data.data) {
                        return interaction.editReply(`📧 Found email: ${data.data.email}`);
                    } else {
                        return interaction.editReply(`❌ No email found for ${target}`);
                    }
                } catch (err: any) {
                    return interaction.editReply(`❌ Error fetching email data: ${err.message}`);
                }
            } else if (isUsername) {
                // Use Social Searcher API
                const searcherUrl = `https://api.social-searcher.com/v2/users?q=${encodeURIComponent(target)}&key=YOUR_API_KEY`;
                try {
                    const res = await fetch(searcherUrl);
                    const data = await res.json() as any;
                    if (data.data) {
                        const profiles = data.data.map((profile: any) => `- ${profile.network}: ${profile.username}`).join('\n');
                        return interaction.editReply(`👤 Found profiles:\n\`\`\`\n${profiles}\n\`\`\``);
                    } else {
                        return interaction.editReply(`❌ No profiles found for ${target}`);
                    }
                } catch (err: any) {
                    return interaction.editReply(`❌ Error fetching username data: ${err.message}`);
                }
            } else {
                return interaction.editReply(`❌ Invalid target: ${target}`);
            }
        }
        

        default:
            return interaction.editReply({
                content: "❌ Unknown subcommand.",
            });
    }
}
