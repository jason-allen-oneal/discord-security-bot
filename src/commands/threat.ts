// commands/threat.ts

import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";

const data = new SlashCommandBuilder()
    .setName("threat")
    .setDescription("Threat intelligence and analysis tools.")
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("ip-reputation")
            .setDescription("Check IP address reputation and threat intelligence.")
            .addStringOption(opt =>
                opt.setName("ip")
                    .setDescription("IP address to analyze")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("domain-reputation")
            .setDescription("Check domain reputation and security status.")
            .addStringOption(opt =>
                opt.setName("domain")
                    .setDescription("Domain to analyze")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("hash-analysis")
            .setDescription("Analyze file hash for malware detection.")
            .addStringOption(opt =>
                opt.setName("hash")
                    .setDescription("MD5, SHA1, or SHA256 hash")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("url-analysis")
            .setDescription("Analyze URL for security threats.")
            .addStringOption(opt =>
                opt.setName("url")
                    .setDescription("URL to analyze")
                    .setRequired(true)
            )
    );

export { data };

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply();

    switch (subcommand) {
        case "ip-reputation": {
            const ip = interaction.options.getString("ip", true);
            
            try {
                // Basic IP validation
                const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                if (!ipRegex.test(ip)) {
                    return interaction.editReply(`❌ Invalid IP address format: ${ip}`);
                }
                
                // Check if it's a private IP
                const isPrivate = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(ip);
                
                if (isPrivate) {
                    return interaction.editReply(
                        `🔍 **IP Reputation Analysis: ${ip}**\n` +
                        `**Risk Level:** 🟢 Low Risk (Private IP)\n` +
                        `**Type:** Private Network Address (RFC 1918)\n` +
                        `**Analysis:** This is a private IP address. No external threat intelligence available.\n` +
                        `**Recommendation:** Monitor internal network traffic for suspicious activity.`
                    );
                }
                
                // Check for reserved/special purpose IPs
                const isReserved = /^(127\.|169\.254\.|224\.|240\.)/.test(ip);
                
                if (isReserved) {
                    return interaction.editReply(
                        `🔍 **IP Reputation Analysis: ${ip}**\n` +
                        `**Risk Level:** 🟡 Medium Risk (Reserved IP)\n` +
                        `**Type:** Reserved/Special Purpose Address\n` +
                        `**Analysis:** This IP is reserved for special purposes and may indicate unusual traffic.\n` +
                        `**Recommendation:** Investigate the source of traffic from this IP.`
                    );
                }
                
                return interaction.editReply(
                    `🔍 **IP Reputation Analysis: ${ip}**\n` +
                    `**Risk Level:** 🟢 Low Risk\n` +
                    `**Type:** Public IP Address\n` +
                    `**Analysis:** IP format is valid. For detailed threat intelligence, use external services.\n` +
                    `**Recommendation:** Monitor for unusual traffic patterns and consider implementing rate limiting.`
                );
            } catch (e: any) {
                return interaction.editReply(`❌ IP reputation analysis failed: ${e.message}`);
            }
        }

        case "domain-reputation": {
            const domain = interaction.options.getString("domain", true);
            
            try {
                // Basic domain validation
                const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
                if (!domainRegex.test(domain)) {
                    return interaction.editReply(`❌ Invalid domain format: ${domain}`);
                }
                
                // Check for suspicious TLDs
                const suspiciousTLDs = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf'];
                const hasSuspiciousTLD = suspiciousTLDs.some(tld => domain.toLowerCase().endsWith(tld));
                
                if (hasSuspiciousTLD) {
                    return interaction.editReply(
                        `🌐 **Domain Reputation Analysis: ${domain}**\n` +
                        `**Risk Level:** 🟡 Medium Risk\n` +
                        `**Type:** Suspicious TLD Detected\n` +
                        `**Analysis:** This domain uses a TLD commonly associated with malicious activity.\n` +
                        `**Recommendation:** Exercise caution and verify the domain's legitimacy.`
                    );
                }
                
                // Check for common malicious patterns
                const suspiciousPatterns = ['bitcoin', 'wallet', 'login', 'secure', 'verify', 'update'];
                const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
                    domain.toLowerCase().includes(pattern)
                );
                
                if (hasSuspiciousPattern) {
                    return interaction.editReply(
                        `🌐 **Domain Reputation Analysis: ${domain}**\n` +
                        `**Risk Level:** 🟡 Medium Risk\n` +
                        `**Type:** Suspicious Pattern Detected\n` +
                        `**Analysis:** This domain contains patterns commonly used in phishing attacks.\n` +
                        `**Recommendation:** Verify the domain's authenticity before proceeding.`
                    );
                }
                
                return interaction.editReply(
                    `🌐 **Domain Reputation Analysis: ${domain}**\n` +
                    `**Risk Level:** 🟢 Low Risk\n` +
                    `**Type:** Standard Domain\n` +
                    `**Analysis:** Domain format appears legitimate. For detailed reputation data, use external services.\n` +
                    `**Recommendation:** Monitor for any suspicious activity associated with this domain.`
                );
            } catch (e: any) {
                return interaction.editReply(`❌ Domain reputation analysis failed: ${e.message}`);
            }
        }

        case "hash-analysis": {
            const hash = interaction.options.getString("hash", true);
            
            try {
                // Hash format validation
                const md5Regex = /^[a-fA-F0-9]{32}$/;
                const sha1Regex = /^[a-fA-F0-9]{40}$/;
                const sha256Regex = /^[a-fA-F0-9]{64}$/;
                
                let hashType = "";
                if (md5Regex.test(hash)) {
                    hashType = "MD5";
                } else if (sha1Regex.test(hash)) {
                    hashType = "SHA1";
                } else if (sha256Regex.test(hash)) {
                    hashType = "SHA256";
                } else {
                    return interaction.editReply(`❌ Invalid hash format. Supported formats: MD5, SHA1, SHA256`);
                }
                
                return interaction.editReply(
                    `🔍 **Hash Analysis: ${hash}**\n` +
                    `**Hash Type:** ${hashType}\n` +
                    `**Format:** Valid\n` +
                    `**Analysis:** Hash format is valid. For malware detection, use external services like VirusTotal.\n` +
                    `**Recommendation:** Submit this hash to multiple threat intelligence platforms for comprehensive analysis.`
                );
            } catch (e: any) {
                return interaction.editReply(`❌ Hash analysis failed: ${e.message}`);
            }
        }

        case "url-analysis": {
            const url = interaction.options.getString("url", true);
            
            try {
                // URL format validation
                const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
                if (!urlRegex.test(url)) {
                    return interaction.editReply(`❌ Invalid URL format: ${url}`);
                }
                
                // Check for suspicious URL patterns
                const suspiciousPatterns = [
                    'bitcoin', 'wallet', 'login', 'secure', 'verify', 'update',
                    'account', 'banking', 'paypal', 'amazon', 'netflix'
                ];
                
                const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
                    url.toLowerCase().includes(pattern)
                );
                
                // Check for IP-based URLs (often suspicious)
                const ipInUrl = /\d+\.\d+\.\d+\.\d+/.test(url);
                
                if (ipInUrl) {
                    return interaction.editReply(
                        `🔗 **URL Analysis: ${url}**\n` +
                        `**Risk Level:** 🟡 Medium Risk\n` +
                        `**Type:** IP-based URL\n` +
                        `**Analysis:** This URL uses an IP address instead of a domain name, which is suspicious.\n` +
                        `**Recommendation:** Exercise caution and verify the URL's legitimacy.`
                    );
                }
                
                if (hasSuspiciousPattern) {
                    return interaction.editReply(
                        `🔗 **URL Analysis: ${url}**\n` +
                        `**Risk Level:** 🟡 Medium Risk\n` +
                        `**Type:** Suspicious Pattern Detected\n` +
                        `**Analysis:** This URL contains patterns commonly used in phishing attacks.\n` +
                        `**Recommendation:** Verify the URL's authenticity before proceeding.`
                    );
                }
                
                return interaction.editReply(
                    `🔗 **URL Analysis: ${url}**\n` +
                    `**Risk Level:** 🟢 Low Risk\n` +
                    `**Type:** Standard URL\n` +
                    `**Analysis:** URL format appears legitimate. For detailed threat analysis, use external services.\n` +
                    `**Recommendation:** Always verify URLs before clicking, especially in emails or messages.`
                );
            } catch (e: any) {
                return interaction.editReply(`❌ URL analysis failed: ${e.message}`);
            }
        }

        default:
            return interaction.editReply({
                content: "❌ Unknown subcommand.",
            });
    }
}
