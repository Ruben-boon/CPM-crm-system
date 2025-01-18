export function formFieldsToNestedDocument(formFields: FormField[]) {
    const result = {};
  
    formFields.forEach((field) => {
      if (!field.value) return;
  
      // Split the path into segments (e.g., "general.firstName" -> ["general", "firstName"])
      const pathSegments = field.id.split('.');
      let current = result;
  
      // Create nested objects for all segments except the last one
      for (let i = 0; i < pathSegments.length - 1; i++) {
        const segment = pathSegments[i];
        if (!current[segment]) {
          current[segment] = {};
        }
        current = current[segment];
      }
  
      // Set the value at the final path segment
      const lastSegment = pathSegments[pathSegments.length - 1];
      current[lastSegment] = field.value;
    });
  
    return result;
  }
  
  // Example usage:
  // const fields = [
  //   { id: 'general.firstName', value: 'John' },
  //   { id: 'general.lastName', value: 'Doe' }
  // ];
  // Result: { general: { firstName: 'John', lastName: 'Doe' } }