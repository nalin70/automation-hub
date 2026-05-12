const { prisma } = require('../../lib/prisma');

function getTelegramUserData(msg) {
  const from = msg.from || {};
  const chat = msg.chat || {};
  const telegramUserId = String(from.id || chat.id);
  const telegramChatId = String(chat.id);

  return {
    telegramUserId,
    telegramChatId,
    username: from.username || null,
    firstName: from.first_name || null,
    lastName: from.last_name || null,
  };
}

async function findOrCreateTelegramUser(msg) {
  const data = getTelegramUserData(msg);

  return prisma.user.upsert({
    where: {
      telegramUserId: data.telegramUserId,
    },
    create: data,
    update: {
      telegramChatId: data.telegramChatId,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
    },
  });
}

module.exports = { findOrCreateTelegramUser };