export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward request to your backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/warranty`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
