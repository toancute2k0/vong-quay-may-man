import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'wheel.json');

// Helper to read data
function readData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      // Return default if file doesn't exist yet (or recreate it)
      return { options: [], history: [] };
    }
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { options: [], history: [] };
  }
}

// Helper to write data
function writeData(data: any) {
  try {
    // Ensure directory exists
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;
    const currentData = readData();

    if (action === 'ADD_OPTION') {
      currentData.options.push(payload);
    } else if (action === 'DELETE_OPTION') {
      currentData.options = currentData.options.filter((opt: any) => opt.id !== payload.id);
    } else if (action === 'ADD_HISTORY') {
      // Add timestamp if not present
      const entry = { ...payload, timestamp: new Date().toISOString() };
      currentData.history.unshift(entry);
      // Keep only last 50 entries
      if (currentData.history.length > 50) {
        currentData.history = currentData.history.slice(0, 50);
      }
    } else if (action === 'RESET_HISTORY') {
      currentData.history = [];
    }

    writeData(currentData);
    return NextResponse.json({ success: true, data: currentData });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}
