import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');
    const lang = searchParams.get('lang') || 'en';

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId is required' },
        { status: 400 }
      );
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: lang,
    });

    return NextResponse.json(transcript);
  } catch (error) {
    console.error('Transcript fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
