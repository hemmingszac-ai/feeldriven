export async function readError(response: Response) {
  try {
    const errorBody = await response.json()
    return errorBody?.error?.message ?? JSON.stringify(errorBody)
  } catch {
    return response.text()
  }
}
