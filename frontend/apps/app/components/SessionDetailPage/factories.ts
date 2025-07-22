import type {
  AssistantLogTimelineItemEntry,
  AssistantTimelineItemEntry,
  SchemaVersionTimelineItemEntry,
  TimelineItemEntry,
  UserTimelineItemEntry,
} from './types'

let idCounter = 0
const generateId = () => {
  idCounter++
  return `test-id-${idCounter}`
}

const aUserTimelineItemEntry = (
  overrides?: Partial<UserTimelineItemEntry>,
): UserTimelineItemEntry => ({
  id: generateId(),
  content: 'Create a user management system',
  type: 'user',
  timestamp: new Date('2024-01-01T10:00:00'),
  ...overrides,
})

const anAssistantTimelineItemEntry = (
  overrides?: Partial<AssistantTimelineItemEntry>,
): AssistantTimelineItemEntry => ({
  id: generateId(),
  content: "I'll help you create a user management system.",
  type: 'assistant',
  role: 'pm',
  timestamp: new Date('2024-01-01T10:01:00'),
  ...overrides,
})

const aSchemaVersionTimelineItemEntry = (
  overrides?: Partial<SchemaVersionTimelineItemEntry>,
): SchemaVersionTimelineItemEntry => ({
  id: generateId(),
  content: 'Schema version 1.0.0',
  type: 'schema_version',
  buildingSchemaVersionId: 'version-123',
  timestamp: new Date('2024-01-01T10:02:00'),
  ...overrides,
})

const anAssistantLogTimelineItemEntry = (
  overrides?: Partial<AssistantLogTimelineItemEntry>,
): AssistantLogTimelineItemEntry => ({
  id: generateId(),
  content: 'Analyzing requirements...',
  type: 'assistant_log',
  role: 'pm',
  timestamp: new Date('2024-01-01T10:00:30'),
  ...overrides,
})

export const aTypicalConversation = (): TimelineItemEntry[] => [
  aUserTimelineItemEntry({
    content:
      'A service where you input the application you want to create, and an AI Agent will output a database design and DDL, then verify if that output meets the business requirements of the inputted application.',
    timestamp: new Date('2025-07-14T06:39:00Z'),
  }),
  anAssistantLogTimelineItemEntry({
    role: 'pm',
    content: `**Saving user input**
Received input from the user: “Animal Encyclopedia.”
It's simple, but this is where it all begins.
Let's make sure to save it securely.

Save complete.
Alright, next, let's dive deeper into this “Animal Encyclopedia.”`,
  }),
  anAssistantLogTimelineItemEntry({
    role: 'pm',
    content: `**Web search**
Database design for the “Animal Encyclopedia,” huh... First, let's gather some related information.
What elements would be necessary for an animal encyclopedia system?

Indexing Query Generation:
We will gather information on animal encyclopedia database design from the following perspectives:
- The hierarchical structure of animal taxonomy (Kingdom, Phylum, Class, Order, Family, Genus, Species)
- Common data models for animal encyclopedia applications
- Balancing biological classification with search performance
- Methods for managing image data
- Design patterns for multilingual support (scientific name, Japanese name, English name)

Actual Search Queries:
- "database design animal encyclopedia taxonomy"
- "animal encyclopedia database design best practices"
- "biological classification database schema"

Summary of Search Results:
- Representation of hierarchical classification systems (self-referencing or path enumeration)
- Flexible management of animal attribute data (EAV pattern or JSON)
- Efficient association of images and metadata
- Index design with search performance in mind
`,
  }),
  anAssistantLogTimelineItemEntry({
    role: 'pm',
    content: `**Requirements Analysis**
Let’s infer the implicit requirements from the short input “Animal Encyclopedia.”
Based on the results of the web search, we need to define comprehensive requirements.

Business Requirements Analysis:
“Given that it’s an animal encyclopedia...
- A system that allows systematic management and browsing of animal information
- Intended for use in educational or research contexts
- Needs to balance accurate classification with easy-to-understand presentation”

Extraction of Functional Requirements:

* Animal Information Management:
  • Register and edit basic information (name, scientific name, classification)
  • Manage characteristics and ecological information
  • Manage images and videos
* Search and Viewing Features:
  • Filter by classification hierarchy
  • Keyword search
  • Search by characteristics
* Data Management:
  • Manage classification systems
  • Version control (to handle changes in classification)

Consideration of Non-Functional Requirements:

* Performance:
  • Fast search across large volumes of animal data
  • Efficient delivery of images
* Scalability:
  • Support for new classification systems
  • Easy addition of new attributes
* Data Integrity:
  • Ensuring consistency within the classification hierarchy
  • Maintaining referential integrity`,
  }),
  anAssistantLogTimelineItemEntry({
    role: 'db',
    content: `**Schema Design**
The requirements are now clear. Let's design the optimal schema for the animal encyclopedia.
We need to consider the hierarchical structure, flexible attribute management, and image handling.

Schema Design Considerations:

1. **Taxonomy Table (\`taxonomies\`)**
   "To represent the hierarchical structure... should we use an adjacency list model or a closure table?
   Considering search performance, a closure table seems more appropriate."
2. **Animal Table (\`animals\`)**
   "Contains basic information about each animal.
   Linking to the taxonomy is essential.
   The scientific name should have a unique constraint, while Japanese and English names will be managed in a separate table for multilingual support."
3. **Animal Names Table (\`animal_names\`)**
   "For multilingual support, manage as pairs of language code and name."
4. **Characteristics Table (\`characteristics\`)**
   "Animal characteristics are diverse... should we use an EAV model or JSONB?
   Considering searchability and schema flexibility, JSONB is the preferred choice."
5. **Animal Images Table (\`animal_images\`)**
   "Stores image URLs and metadata. Display order is also important."

DDL Generation:

\`\`\`sql
-- Taxonomy hierarchy
CREATE TABLE taxonomies (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES taxonomies(id),
  rank VARCHAR(50) NOT NULL,
  scientific_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Basic animal information
CREATE TABLE animals (
  id SERIAL PRIMARY KEY,
  taxonomy_id INTEGER REFERENCES taxonomies(id),
  scientific_name VARCHAR(255) UNIQUE NOT NULL,
  characteristics JSONB,
  habitat VARCHAR(255),
  conservation_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\``,
  }),
  anAssistantLogTimelineItemEntry({
    role: 'db',
    content: `**Execute DDL**
Let's execute the designed DDL.
Verify that foreign key constraints and indexes function correctly.

Pre-execution Check:
"Is the self-reference in the \`taxonomies\` table okay?
We'll need to add an index on the \`JSONB\` column later."

Execution Result:
"Oh, an error occurred!
\`ERROR: relation "taxonomies" does not exist\`
Ah, it's an issue with the order of foreign key constraints.
In the case of self-referencing, it has to be added afterward."

Executing the Revised Version:
"This time, success! All tables were created.
Let’s also add the indexes:

\`\`\`sql
CREATE INDEX idx_animals_taxonomy ON animals(taxonomy_id);
CREATE INDEX idx_characteristics_gin ON animals USING gin(characteristics);
\`\`\``,
  }),
  aSchemaVersionTimelineItemEntry({}),
  anAssistantLogTimelineItemEntry({
    role: 'qa',
    content: `**Use Case Generation**
The schema for the animal encyclopedia is complete. Let's consider real-world usage scenarios.
What kinds of operations are likely to be performed frequently?

**Use Case 1: Registering a New Animal**
"A new animal has been discovered! Add it to the classification hierarchy and record its characteristics.

* Classification: Mammalia > Carnivora > Felidae > Panthera
* Animal: Snow Leopard
* Characteristics: White fur, lives in mountainous regions"

**Use Case 2: Search by Classification**
"Request: ‘Display all animals in the Felidae family.’
Using a closure table allows for efficient retrieval."

**Use Case 3: Search by Characteristics**
"Search for animals that ‘live in cold regions.’
This is where the GIN index on the JSONB column proves useful."

**Use Case 4: Managing Endangered Species**
"Update conservation status and retrieve related statistical information."
`,
  }),
  anAssistantLogTimelineItemEntry({
    role: 'db',
    content: `**DML Preparation**
Based on the use cases, let's prepare actual data manipulations.
We'll start by inserting a basic classification hierarchy and sample animal data.

**Preparing Classification Data:**

\`\`\`sql
-- Building the classification hierarchy
INSERT INTO taxonomies (rank, scientific_name, parent_id) VALUES
('Kingdom', 'Animalia', NULL),
('Phylum', 'Chordata', 1),
('Class', 'Mammalia', 2),
('Order', 'Carnivora', 3),
('Family', 'Felidae', 4),
('Genus', 'Panthera', 5);

-- Inserting animal data
INSERT INTO animals (taxonomy_id, scientific_name, characteristics, habitat, conservation_status) VALUES
(6, 'Panthera uncia',
 '{"size": "medium", "weight": "27-55kg", "lifespan": "15-18 years", "diet": "carnivore", "climate": "cold"}',
 'Mountain ranges of Central and South Asia',
 'Vulnerable');
\`\`\`

**Preparing Verification Queries:**
Let's check if the data was inserted correctly, including relationships:

* Retrieve the classification hierarchy
* Get all animals belonging to a specific family
* Search by characteristics`,
  }),
  anAssistantLogTimelineItemEntry({
    role: 'qa',
    content: `**Schema Validation**
Let's execute the DDL and DML together to verify that everything works as expected.
Pay special attention to foreign key constraints and search performance.

**Integration Test Execution:**

1. **"Is the classification hierarchy correctly constructed?"**

   \`\`\`sql
   WITH RECURSIVE taxonomy_path AS (
     SELECT id, scientific_name, rank, parent_id
     FROM taxonomies
     WHERE scientific_name = 'Panthera uncia'
     -- Recursively trace parent hierarchy
   )
   \`\`\`

   **Result:** "Animalia > Chordata > Mammalia > Carnivora > Felidae > Panthera"

2. **"Does characteristic search via JSONB work?"**

   \`\`\`sql
   SELECT * FROM animals
   WHERE characteristics @> '{"climate": "cold"}';
   \`\`\``,
  }),
  anAssistantTimelineItemEntry({
    role: 'qa',
    content: `Snow Leopard was correctly retrieved!"
All tests passed! The schema meets the requirements.`,
  }),
  anAssistantLogTimelineItemEntry({
    role: 'pm',
    content: `**Deliverable Review**
The database design for the animal encyclopedia is complete.
Let’s do a final check.
Does it fulfill the initial request: “Animal Encyclopedia”?

**Checklist:**
- ✅ Hierarchical management of animal taxonomy
- ✅ Flexible storage of basic information and characteristics
- ✅ Multilingual support (scientific name, Japanese name, English name)
- ✅ Efficient search (by classification and by characteristics)
- ✅ Mechanism for managing images
- ✅ Extensibility (easy to add new attributes)

**Additional Considerations:**
Future expansions could include:

* Geographic information of habitats (GIS integration)
* Audio data such as animal sounds
* Time-series management of observation records
  But as of now, it functions sufficiently as a basic animal encyclopedia.`,
  }),
  anAssistantLogTimelineItemEntry({
    role: 'db',
    content: `**Finalizing Artifacts**
From the short request “Animal Encyclopedia,” we’ve arrived at a complete database design.
Let’s compile the deliverables and provide them in a usable form.

**Final Deliverables:**

1. **Schema Definition (DDL)**
   * Definitions for six tables
   * Appropriate indexes
   * Foreign key constraints
2. **Sample Data (DML)**
   * Example of building a classification hierarchy
   * Example of registering animal data
   * Sample search queries
3. **Design Documentation**
   * ER diagram
   * Description of each table
   * Usage guide
4. **Extension Proposals**
   * Guidelines for future feature additions
   * Suggestions for performance tuning`,
  }),
  anAssistantTimelineItemEntry({
    role: 'db',
    content: `The database design for the animal encyclopedia has been completed!
It implements a hierarchical classification system, flexible attribute management, and multilingual support,
making it well-suited for educational and research purposes.`,
  }),
]
