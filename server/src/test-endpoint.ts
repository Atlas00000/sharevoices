import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:4000';
const EMAIL = 'test10@example.com';
const PASSWORD = 'password123';

// Type guard for axios error
function isAxiosError(error: unknown): error is { response?: { data?: any; message?: string } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object'
  );
}

// Test user registration
async function registerUser() {
  try {
    console.log('Registering user...');
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      email: EMAIL,
      password: PASSWORD,
      name: 'Test Author',
      role: 'author'
    });
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (
      isAxiosError(error) &&
      error.response &&
      error.response.data &&
      error.response.data.message === 'Email already registered'
    ) {
      console.log('User already exists, proceeding to login');
      return null;
    }
    if (isAxiosError(error) && error.response) {
      console.error('Registration error:', error.response.data);
    } else if (error instanceof Error) {
      console.error('Registration error:', error.message);
    } else {
      console.error('Registration error:', error);
    }
    throw error;
  }
}

// Test user login
async function loginUser() {
  try {
    console.log('Logging in...');
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    console.log('Login successful');
    if (
      typeof response.data === 'object' &&
      response.data !== null &&
      'token' in response.data &&
      typeof (response.data as any).token === 'string'
    ) {
      return (response.data as { token: string }).token;
    } else {
      throw new Error('Login response did not contain a token');
    }
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response) {
      console.error('Login error:', error.response.data);
    } else if (error instanceof Error) {
      console.error('Login error:', error.message);
    } else {
      console.error('Login error:', error);
    }
    throw error;
  }
}

// Test article creation
async function createArticle(token: string) {
  try {
    console.log('Creating article...');
    const response = await axios.post(
      `${API_URL}/api/articles`,
      {
        title: 'Test Article',
        content: 'This is a test article',
        category: 'technology'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (typeof response.data === 'object' && response.data !== null) {
    console.log('Article created successfully:', response.data);
    return response.data;
    } else {
      console.log('Article created successfully, but response data is not an object:', response.data);
      return {};
    }
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response) {
      console.error('Article creation error:', error.response.data);
    } else if (error instanceof Error) {
      console.error('Article creation error:', error.message);
    } else {
      console.error('Article creation error:', error);
    }
    throw error;
  }
}

// Run the tests
async function runTests() {
  try {
    // Register or login
    await registerUser();
    const token = await loginUser();
    
    // Create article
    const article = await createArticle(token);
    
    console.log('All tests passed!');
  } catch (error: unknown) {
    if (error instanceof Error) {
    console.error('Test failed:', error.message);
    } else {
      console.error('Test failed:', error);
    }
  }
}

// Run the tests
runTests();
