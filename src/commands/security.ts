// commands/security.ts

import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import { exec } from "child_process";

const cveCache = new Map<string, { data: any, expiresAt: number }>();

const data = new SlashCommandBuilder()
    .setName("security")
    .setDescription("Professional security analysis and vulnerability assessment tools.")
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("breachcheck")
            .setDescription("Check if a password has been compromised in known data breaches.")
            .addStringOption(opt =>
                opt.setName("password")
                    .setDescription("Password to check for compromise")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("cve")
            .setDescription("Search Common Vulnerabilities and Exposures (CVE) database.")
            .addStringOption(opt =>
                opt.setName("query")
                    .setDescription("CVE ID (e.g. CVE-2024-1234)")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("vulnerability-scan")
            .setDescription("Perform basic vulnerability assessment on a target.")
            .addStringOption(opt =>
                opt.setName("target")
                    .setDescription("Target IP or domain for vulnerability assessment")
                    .setRequired(true)
            )
    );

export { data };

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply();

    switch (subcommand) {
        case "breachcheck": {
            const password = interaction.options.getString("password", true);
            const crypto = await import("crypto"); // Dynamic import to avoid top-level Node warnings
            const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
            const prefix = sha1.slice(0, 5);
            const suffix = sha1.slice(5);

            try {
                const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
                    headers: { "User-Agent": "DiscordBot" }
                });

                if (!res.ok) {
                    throw new Error(`HIBP API error: ${res.status}`);
                }

                const text = await res.text();
                const lines = text.split("\n");

                const found = lines.find(line => line.startsWith(suffix));
                if (found) {
                    const [_, count] = found.split(":");
                    return interaction.editReply(`🔒 This password has been found **${count.trim()}** times in breaches. **Change it!**`);
                } else {
                    return interaction.editReply(`✅ This password has **NOT** been found in known breaches.`);
                }
            } catch (e: any) {
                return interaction.editReply(`❌ Password breach check failed: ${e.message}`);
            }
        }

        case "cve": {
            const cveId = interaction.options.getString("query", true).trim().toUpperCase();
            const cached = cveCache.get(cveId);
            const now = Date.now();
            if (cached && cached.expiresAt > now) {
                console.log(`Serving ${cveId} from cache.`);
                const cve = cached.data;
                const description = cve.descriptions?.find((d: any) => d.lang === "en")?.value || "No description available.";
                const published = cve.published || "Unknown";
                const severity = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore ?? "N/A";

                return interaction.editReply(
                    `🧠 CVE Info for \`${cveId}\` (cached):\n` +
                    `**${cveId}**: ${description}\n` +
                    `CVSS Score: ${severity} | Published: ${published}\n` +
                    `<https://nvd.nist.gov/vuln/detail/${cveId}>`
                );
            }

            const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cveId)}`;

            try {
                const res = await fetch(url, {
                    headers: { "User-Agent": "DiscordBot" }
                });

                if (!res.ok) {
                    throw new Error(`NVD API error: ${res.status}`);
                }

                const json = await res.json();
                console.log('json', JSON.stringify(json, null, 2));

                const cveItems = json.vulnerabilities;
                if (!cveItems || cveItems.length === 0) {
                    return interaction.editReply(`❌ No CVE found for \`${cveId}\`.`);
                }

                const cve = cveItems[0].cve;
                cveCache.set(cveId, {
                    data: cve,
                    expiresAt: now + 24 * 60 * 60 * 1000
                });

                const description = cve.descriptions?.find((d: any) => d.lang === "en")?.value || "No description available.";
                const published = cve.published || "Unknown";
                const severity = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore ?? "N/A";

                return interaction.editReply(
                    `🧠 CVE Info for \`${cveId}\`:\n` +
                    `**${cveId}**: ${description}\n` +
                    `CVSS Score: ${severity} | Published: ${published}\n` +
                    `<https://nvd.nist.gov/vuln/detail/${cveId}>`
                );
            } catch (e: any) {
                return interaction.editReply(`❌ CVE lookup failed: ${e.message}`);
            }
        }

        case "vulnerability-scan": {
            const target = interaction.options.getString("target", true).trim();
            
            try {
                // Use nmap for actual port scanning
                exec(`nmap -F ${target}`, async (err, stdout, stderr) => {
                    if (err) {
                        return interaction.editReply(`❌ Vulnerability scan failed: ${err.message}`);
                    }
                    
                    if (!stdout || stdout.includes("0 hosts up")) {
                        return interaction.editReply(
                            `🔍 **Vulnerability Assessment: ${target}**\n` +
                            `**Status:** Target appears to be down or unreachable\n` +
                            `**Analysis:** No hosts responded to scan\n` +
                            `**Recommendation:** Verify target is online and accessible`
                        );
                    }
                    
                    const output = stdout.length > 1900 ? stdout.slice(0, 1900) + "\n..." : stdout;
                    return interaction.editReply(
                        `🔍 **Vulnerability Assessment: ${target}**\n` +
                        `**Scan Results:**\n\`\`\`\n${output}\n\`\`\``
                    );
                });
            } catch (e: any) {
                return interaction.editReply(`❌ Vulnerability scan failed: ${e.message}`);
            }
        }

        default:
            return interaction.editReply({
                content: "❌ Unknown subcommand.",
            });
    }
}
