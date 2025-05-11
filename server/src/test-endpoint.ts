import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:4000';
const EMAIL = 'test10@example.com';
const PASSWORD = 'password123';

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
  } catch (error) {
    if (error.response && error.response.data.message === 'Email already registered') {
      console.log('User already exists, proceeding to login');
      return null;
    }
    console.error('Registration error:', error.response ? error.response.data : error.message);
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
    return response.data.token;
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
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
    console.log('Article created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Article creation error:', error.response ? error.response.data : error.message);
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
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the tests
runTests();
