export const SHOUT_OUT_MAX_MESSAGE_LENGTH = 600

type ShoutOutInput = {
  senderId: string
  recipientId: string
  message: string
}

type ValidShoutOutInput = {
  recipientId: string
  message: string
}

type ValidationResult =
  | {
      ok: true
      value: ValidShoutOutInput
    }
  | {
      ok: false
      error: string
    }

export function validateShoutOutInput(
  input: ShoutOutInput,
  validRecipientIds: Set<string>
): ValidationResult {
  const recipientId = input.recipientId.trim()
  const message = input.message.trim()

  if (!recipientId || !validRecipientIds.has(recipientId)) {
    return {
      ok: false,
      error: 'Choose a valid recipient.',
    }
  }

  if (recipientId === input.senderId) {
    return {
      ok: false,
      error: 'Choose another team member to recognise.',
    }
  }

  if (!message) {
    return {
      ok: false,
      error: 'Please write a shout-out message.',
    }
  }

  if (message.length > SHOUT_OUT_MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Keep shout-outs to ${SHOUT_OUT_MAX_MESSAGE_LENGTH} characters or less.`,
    }
  }

  return {
    ok: true,
    value: {
      recipientId,
      message,
    },
  }
}
