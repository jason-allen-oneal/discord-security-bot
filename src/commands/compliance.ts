// commands/compliance.ts

import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";

const data = new SlashCommandBuilder()
    .setName("compliance")
    .setDescription("Security compliance and assessment tools.")
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("ssl-check")
            .setDescription("Check SSL/TLS certificate security and compliance.")
            .addStringOption(opt =>
                opt.setName("domain")
                    .setDescription("Domain to check SSL/TLS for")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("headers-check")
            .setDescription("Analyze security headers for compliance.")
            .addStringOption(opt =>
                opt.setName("url")
                    .setDescription("URL to check security headers")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("password-strength")
            .setDescription("Check password strength and compliance requirements.")
            .addStringOption(opt =>
                opt.setName("password")
                    .setDescription("Password to analyze")
                    .setRequired(true)
            )
    )
    .addSubcommand((sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("gdpr-check")
            .setDescription("Basic GDPR compliance checklist for websites.")
            .addStringOption(opt =>
                opt.setName("url")
                    .setDescription("URL to check for GDPR compliance")
                    .setRequired(true)
            )
    );

export { data };

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply();

    switch (subcommand) {
        case "ssl-check": {
            const domain = interaction.options.getString("domain", true);
            
            try {
                const response = await fetch(`https://${domain}`, {
                    method: 'HEAD',
                    redirect: 'follow'
                });
                
                const securityHeaders = {
                    'strict-transport-security': response.headers.get('strict-transport-security'),
                    'x-frame-options': response.headers.get('x-frame-options'),
                    'x-content-type-options': response.headers.get('x-content-type-options'),
                    'x-xss-protection': response.headers.get('x-xss-protection')
                };
                
                const hasHSTS = securityHeaders['strict-transport-security'] ? "✅" : "❌";
                const hasFrameOptions = securityHeaders['x-frame-options'] ? "✅" : "❌";
                const hasContentTypeOptions = securityHeaders['x-content-type-options'] ? "✅" : "❌";
                const hasXSSProtection = securityHeaders['x-xss-protection'] ? "✅" : "❌";
                
                return interaction.editReply(
                    `🔒 **SSL/TLS Security Assessment: ${domain}**\n` +
                    `**HTTPS Status:** ${response.ok ? "✅ Secure" : "❌ Insecure"}\n` +
                    `**HSTS:** ${hasHSTS} HTTP Strict Transport Security\n` +
                    `**Frame Options:** ${hasFrameOptions} X-Frame-Options\n` +
                    `**Content Type:** ${hasContentTypeOptions} X-Content-Type-Options\n` +
                    `**XSS Protection:** ${hasXSSProtection} X-XSS-Protection\n` +
                    `**Recommendation:** ${response.ok ? "SSL/TLS configuration appears secure." : "Enable HTTPS and security headers."}`
                );
            } catch (e: any) {
                return interaction.editReply(`❌ SSL check failed: ${e.message}`);
            }
        }

        case "headers-check": {
            const url = interaction.options.getString("url", true);
            
            try {
                const response = await fetch(url, {
                    method: 'HEAD',
                    redirect: 'follow'
                });
                
                const headers = response.headers;
                const securityHeaders = {
                    'strict-transport-security': headers.get('strict-transport-security'),
                    'x-frame-options': headers.get('x-frame-options'),
                    'x-content-type-options': headers.get('x-content-type-options'),
                    'x-xss-protection': headers.get('x-xss-protection'),
                    'content-security-policy': headers.get('content-security-policy'),
                    'referrer-policy': headers.get('referrer-policy'),
                    'permissions-policy': headers.get('permissions-policy')
                };
                
                let score = 0;
                let total = 0;
                let report = "**Security Headers Analysis:**\n";
                
                Object.entries(securityHeaders).forEach(([header, value]) => {
                    total++;
                    if (value) {
                        score++;
                        report += `✅ ${header}: ${value}\n`;
                    } else {
                        report += `❌ ${header}: Missing\n`;
                    }
                });
                
                const percentage = ((score / total) * 100).toFixed(1);
                const grade = Number(percentage) >= 80 ? "🟢 A" : Number(percentage) >= 60 ? "🟡 B" : Number(percentage) >= 40 ? "🟠 C" : "🔴 D";
                
                return interaction.editReply(
                    `🛡️ **Security Headers Assessment: ${url}**\n` +
                    `**Grade:** ${grade} (${percentage}%)\n` +
                    `**Score:** ${score}/${total} headers present\n\n` +
                    report
                );
            } catch (e: any) {
                return interaction.editReply(`❌ Headers check failed: ${e.message}`);
            }
        }

        case "password-strength": {
            const password = interaction.options.getString("password", true);
            
            // Password strength analysis
            const hasLower = /[a-z]/.test(password);
            const hasUpper = /[A-Z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const length = password.length;
            
            let score = 0;
            let feedback = [];
            
            if (length >= 8) score += 1;
            else feedback.push("Password should be at least 8 characters long");
            
            if (length >= 12) score += 1;
            if (hasLower) score += 1;
            else feedback.push("Include lowercase letters");
            
            if (hasUpper) score += 1;
            else feedback.push("Include uppercase letters");
            
            if (hasNumbers) score += 1;
            else feedback.push("Include numbers");
            
            if (hasSpecial) score += 1;
            else feedback.push("Include special characters");
            
            const strength = score <= 2 ? "🔴 Weak" : 
                           score <= 4 ? "🟡 Medium" : 
                           score <= 5 ? "🟢 Strong" : "🟢 Very Strong";
            
            const compliance = score >= 4 ? "✅ Compliant" : "❌ Non-compliant";
            
            return interaction.editReply(
                `🔐 **Password Strength Analysis**\n` +
                `**Strength:** ${strength}\n` +
                `**Compliance:** ${compliance}\n` +
                `**Score:** ${score}/6\n` +
                `**Length:** ${length} characters\n\n` +
                `**Requirements Met:**\n` +
                `${length >= 8 ? "✅" : "❌"} Minimum 8 characters\n` +
                `${hasLower ? "✅" : "❌"} Lowercase letters\n` +
                `${hasUpper ? "✅" : "❌"} Uppercase letters\n` +
                `${hasNumbers ? "✅" : "❌"} Numbers\n` +
                `${hasSpecial ? "✅" : "❌"} Special characters\n\n` +
                `${feedback.length > 0 ? "**Recommendations:**\n" + feedback.join("\n") : "✅ Password meets all requirements!"}`
            );
        }

        case "gdpr-check": {
            const url = interaction.options.getString("url", true);
            
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    redirect: 'follow'
                });
                
                const html = await response.text();
                const headers = response.headers;
                
                // Basic GDPR compliance checks
                const hasPrivacyPolicy = /privacy|gdpr|data protection/i.test(html);
                const hasCookieNotice = /cookie|consent/i.test(html);
                const hasContactInfo = /contact|email|phone/i.test(html);
                const hasDataController = /data controller|data protection officer/i.test(html);
                const hasOptOut = /opt.?out|unsubscribe|withdraw consent/i.test(html);
                
                let score = 0;
                let total = 5;
                let report = "**GDPR Compliance Checklist:**\n";
                
                if (hasPrivacyPolicy) { score++; report += "✅ Privacy Policy\n"; } else { report += "❌ Privacy Policy\n"; }
                if (hasCookieNotice) { score++; report += "✅ Cookie Notice\n"; } else { report += "❌ Cookie Notice\n"; }
                if (hasContactInfo) { score++; report += "✅ Contact Information\n"; } else { report += "❌ Contact Information\n"; }
                if (hasDataController) { score++; report += "✅ Data Controller Info\n"; } else { report += "❌ Data Controller Info\n"; }
                if (hasOptOut) { score++; report += "✅ Opt-out Mechanisms\n"; } else { report += "❌ Opt-out Mechanisms\n"; }
                
                const percentage = ((score / total) * 100).toFixed(1);
                const compliance = Number(percentage) >= 80 ? "🟢 Compliant" : Number(percentage) >= 60 ? "🟡 Partially Compliant" : "🔴 Non-compliant";
                
                return interaction.editReply(
                    `📋 **GDPR Compliance Assessment: ${url}**\n` +
                    `**Status:** ${compliance}\n` +
                    `**Score:** ${score}/${total} (${percentage}%)\n\n` +
                    report +
                    `\n**Note:** This is a basic automated check. Full GDPR compliance requires legal review.`
                );
            } catch (e: any) {
                return interaction.editReply(`❌ GDPR check failed: ${e.message}`);
            }
        }

        default:
            return interaction.editReply({
                content: "❌ Unknown subcommand.",
            });
    }
}
