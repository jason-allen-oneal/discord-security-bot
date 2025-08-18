# Discord Security Bot 🔒

A professional cybersecurity Discord bot designed for security professionals, providing comprehensive threat intelligence, compliance checks, vulnerability assessment, and security analysis tools.

## Features

### 🔍 **Threat Intelligence**
- **IP Reputation Analysis**: Validate IP addresses and identify private/reserved ranges
- **Domain Reputation**: Analyze domains for suspicious patterns and TLDs
- **Hash Analysis**: Validate file hashes (MD5, SHA1, SHA256) for malware detection
- **URL Analysis**: Check URLs for suspicious patterns and IP-based threats

### 🛡️ **Security Assessment**
- **Vulnerability Scanning**: Real nmap-based port scanning and service detection
- **SSL/TLS Analysis**: Check certificate security and security headers
- **Security Headers**: Comprehensive analysis of web security headers
- **Password Strength**: Professional password compliance assessment

### 📋 **Compliance Tools**
- **GDPR Compliance**: Basic automated GDPR compliance checklist
- **Security Standards**: Check adherence to security best practices
- **Compliance Reporting**: Generate security assessment reports

### 🔧 **Reconnaissance Tools**
- **WHOIS Lookup**: Domain and IP registration information
- **DNS Analysis**: DNS record enumeration and analysis
- **Subdomain Discovery**: Find subdomains for target domains
- **OSINT Gathering**: Basic open-source intelligence collection

### 🤖 **AI Security Assistant**
- **Security-Focused AI**: Professional cybersecurity advice and guidance
- **Threat Analysis**: AI-powered threat assessment and recommendations
- **Compliance Guidance**: Automated compliance and best practice advice

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Discord Bot Token
- LM Studio (for AI features)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jason-allen-oneal/discord-security-bot.git
   cd discord-security-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file:
   ```env
   APP_TOKEN=your_discord_bot_token_here
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## Usage

### Commands

#### `/threat`
- `ip-reputation <ip>` - Analyze IP address reputation
- `domain-reputation <domain>` - Check domain security status
- `hash-analysis <hash>` - Validate file hashes
- `url-analysis <url>` - Analyze URL for threats

#### `/security`
- `breachcheck <password>` - Check password compromise status
- `cve <cve-id>` - Search CVE database
- `vulnerability-scan <target>` - Perform vulnerability assessment

#### `/compliance`
- `ssl-check <domain>` - SSL/TLS security assessment
- `headers-check <url>` - Security headers analysis
- `password-strength <password>` - Password compliance check
- `gdpr-check <url>` - GDPR compliance assessment

#### `/recon`
- `whois <target>` - WHOIS information lookup
- `dns <domain>` - DNS record analysis
- `subdomains <domain>` - Subdomain enumeration
- `osint <target>` - OSINT gathering

#### `/tools`
- `hash <text> <algorithm>` - Generate cryptographic hashes
- `scan-server <target>` - Network port scanning
- `scan-site <url>` - Web application security scanning

#### `/ai <message>`
- Security-focused AI assistant for cybersecurity guidance

## Security Features

### 🔒 **Professional Focus**
- No NSFW or inappropriate content
- Ethical security practices only
- Compliance with security standards
- Professional threat analysis

### 🛡️ **Real Tools Integration**
- Actual nmap scanning (no simulations)
- Real WHOIS lookups
- Genuine security header analysis
- Authentic vulnerability assessment

### 📊 **Comprehensive Reporting**
- Detailed security assessments
- Risk level classifications
- Actionable recommendations
- Compliance status reports

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Considerations

- This bot is designed for professional security use only
- All tools should be used responsibly and ethically
- Respect target systems and applicable laws
- Use only on systems you own or have permission to test

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Create an issue in this repository
- Ensure you're using the latest version
- Provide detailed error messages and logs

---

**⚠️ Disclaimer**: This tool is for professional security assessment only. Users are responsible for ensuring they have proper authorization before testing any systems. The authors are not responsible for any misuse of this software.
