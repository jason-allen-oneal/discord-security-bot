// src/commands/ai.ts

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export const data = new SlashCommandBuilder()
  .setName("ai")
  .setDescription("Security-focused AI assistant for cybersecurity professionals")
  .addStringOption(option =>
    option
      .setName("message")
      .setDescription("Your security-related question or request")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const msg = interaction.options.getString("message");
  const userid = interaction.user.username;
  const username = interaction.member?.user?.username || interaction.user.username;


  await interaction.deferReply();

  try {
    const response = await axios.post('http://localhost:1234/v1/chat/completions', {
      model: 'llama-3.1-8b-kali-pentester', // Replace with your loaded model's ID
      messages: [
        { role: 'system', content: 'You are a professional cybersecurity assistant. Provide accurate, helpful, and ethical security advice. Focus on defensive security practices, threat analysis, and compliance guidance.' },
        { role: 'user', content: msg }
      ],
      temperature: 0.7,
      max_tokens: 512,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const generatedText = response.data.choices[0].message.content.trim();

    await interaction.editReply(`**${username} said:**\n> ${msg}\n\n**AI responded:**\n\`\`\`\n${generatedText}\n\`\`\``);
  } catch (err: any) {
    console.error('LM Studio API Error:', err?.response?.data || err.message);
    const errorMsg = err?.response?.data?.error || err.message || 'Unknown error';
    await interaction.editReply(`❌ Error: ${errorMsg}`);
  }
}
