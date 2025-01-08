interface MockDocument {
    [key: string]: any;
  }
  
  interface MockCollection {
    [key: string]: MockDocument[];
  }
  
  // Sample database structure
  const mockDatabase: MockCollection = {
    "contacts": [
      {
        _id: "c1",
        type: ["client"],
        company: {
          name: "TechCorp International",
          vatNumber: "NL123456789B01",
          entity: "BV",
          entityAddress: "Main Office Amsterdam",
          currency: ["EUR", "USD"],
        },
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@techcorp.com",
        phone: "+31612345678",
        address: {
          street: "Zuidplein",
          houseNumber: "36",
          zipCode: "1077 XV",
          country: "Netherlands",
        },
        birthday: new Date("1985-06-15"),
      },
      {
        _id: "c2",
        type: ["client"],
        company: {
          name: "Dutch Innovation Labs",
          vatNumber: "NL987654321B01",
          entity: "BV",
          entityAddress: "Rotterdam HQ",
          currency: ["EUR"],
        },
        firstName: "Jan",
        lastName: "van der Berg",
        email: "j.vandenberg@dutchinnovation.nl",
        phone: "+31698765432",
        address: {
          street: "Wilhelminakade",
          houseNumber: "42",
          zipCode: "3072 AP",
          country: "Netherlands",
        },
        birthday: new Date("1990-03-22"),
      },
      {
        _id: "c3",
        type: ["client", "supplier"],
        company: {
          name: "Global Tech Solutions",
          vatNumber: "NL456789012B01",
          entity: "NV",
          entityAddress: "Utrecht Business Center",
          currency: ["EUR", "GBP", "USD"],
        },
        firstName: "Emma",
        lastName: "De Vries",
        email: "emma.devries@globaltech.com",
        phone: "+31634567890",
        address: {
          street: "Stationsplein",
          houseNumber: "15",
          zipCode: "3511 ED",
          country: "Netherlands",
        },
        birthday: new Date("1988-12-10"),
      }
    ],
    "users": [
      {
        _id: "1",
        name: "John Doe",
        email: "john@example.com",
        address: {
          street: "123 Main St",
          city: "New York",
          country: "USA"
        },
        age: 30,
        company: {
          name: "Tech Corp",
          role: "Developer"
        }
      },
      {
        _id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        address: {
          street: "456 Park Ave",
          city: "Boston",
          country: "USA"
        },
        age: 28,
        company: {
          name: "Design Studios",
          role: "Designer"
        }
      }
    ],
    "products": [
      {
        _id: "101",
        name: "Laptop Pro",
        category: {
          name: "Electronics",
          subcategory: "Computers"
        },
        price: 1299,
        description: "High-performance laptop",
        inStock: true
      },
      {
        _id: "102",
        name: "Wireless Mouse",
        category: {
          name: "Electronics",
          subcategory: "Accessories"
        },
        price: 49,
        description: "Ergonomic wireless mouse",
        inStock: true
      }
    ]
  };
  
  // Mock MongoDB client functions
  export class MockMongoClient {
    private database = mockDatabase;
  
    // Simulate MongoDB connection
    static async connect(uri: string): Promise<MockMongoClient> {
      console.log('Connected to mock MongoDB:', uri);
      return new MockMongoClient();
    }
  
    // Get database instance
    db(name: string) {
      return {
        collection: (collectionName: string) => {
          return {
            // Find one document
            findOne: async () => {
              return this.database[collectionName]?.[0] || null;
            },
            
            // Find documents with query
            find: (query: any) => {
              return {
                toArray: async () => {
                  const collection = this.database[collectionName] || [];
                  
                  if (!query) return collection;
  
                  return collection.filter(doc => {
                    // Handle each query criteria
                    return Object.entries(query).every(([field, condition]) => {
                      if (condition.$regex) {
                        const regex = new RegExp(condition.$regex, condition.$options);
                        
                        if (field.includes('.')) {
                          const [parent, child] = field.split('.');
                          return regex.test(doc[parent]?.[child]);
                        }
                        
                        return regex.test(doc[field]);
                      }
                      return true;
                    });
                  });
                }
              };
            }
          };
        }
      };
    }
  
    // Close connection
    async close() {
      console.log('Closed mock MongoDB connection');
    }
  }