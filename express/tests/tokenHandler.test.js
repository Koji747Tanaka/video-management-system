const {validateUser, generateAccessToken} = require("../helpers/tokenHandler")
require('dotenv').config();
const User = require('../helpers/mongodb/user');
const jwt = require('jsonwebtoken');

describe('generateAccessToken', () => {
  //verify that the generateAccessToken function is calling the jwt.sign method with the correct arguments.
  test('should generate a valid JWT token', () => {
    const id = '123';
    const name = 'Test User';
    const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

    // Mock jwt.sign to control its behavior
    const mockSign = jest.spyOn(jwt, 'sign'); //creates a Jest spy on the jwt.sign method
    mockSign.mockImplementation(() => 'mockToken'); //replaces the implementation of jwt.sign with a mock function that always returns 'mockToken'

    const token = generateAccessToken(id, name);

    expect(mockSign).toHaveBeenCalledWith({ id, name  }, SECRET_KEY, expect.any(Object)); //asserts that jwt.sign was called with specific arguments.
    expect(token).toBe('mockToken');
    mockSign.mockRestore();
  });
});

describe('validateUser', () => {
    test('should validate a user with a valid JWT', async () => {
      const mockJWT = 'valid.jwt.token';
      const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET; 
      const mockUser = { id: '123', username: 'TestUser' };
      // Mock jwt.verify to control its behavior
      jest.spyOn(jwt, 'verify').mockReturnValue({ id: mockUser.id });
      // Mock User.findOne
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      const result = await validateUser(mockJWT);
    
      // check if jwt.verify was called with proper attributes
      expect(jwt.verify).toHaveBeenCalledWith(mockJWT, SECRET_KEY);
      // check if User.findOne was called with proper attributes
      expect(User.findOne).toHaveBeenCalledWith({ id: mockUser.id });
      // return from validateUser should be the same from the return from the findOne
      expect(result).toEqual({ user_id: mockUser.id, username: mockUser.username });
  
      // Restore original implementations
      jwt.verify.mockRestore();
      User.findOne.mockRestore();
    });
  
    test('should return false for invalid JWT', async () => {
      const mockJWT = 'invalid.jwt.token';
  
      // Mock jwt.verify to throw an error
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Unauthorized');
      });
  
      const result = await validateUser(mockJWT);
  
      expect(jwt.verify).toHaveBeenCalledWith(mockJWT, process.env.ACCESS_TOKEN_SECRET);
      expect(result).toBe(false);

      jwt.verify.mockRestore();
    });
  });