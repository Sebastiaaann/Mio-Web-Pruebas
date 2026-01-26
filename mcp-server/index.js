import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const API_HOMA_URL = process.env.API_HOMA_URL || "https://apihoma.homa.cl:7200";
const HOMA_API_KEY = process.env.HOMA_API_KEY;

if (!HOMA_API_KEY) {
  console.error("Error: HOMA_API_KEY environment variable is required.");
  process.exit(1);
}

// Create server instance
const server = new McpServer({
  name: "homa-api-server",
  version: "1.0.0",
});

// Helper function for GET API requests
async function makeApiRequest(endpoint) {
  const url = `${API_HOMA_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': HOMA_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        isError: true,
        content: [{ 
          type: "text", 
          text: `API Error ${response.status}: ${errorText}` 
        }]
      };
    }

    const data = await response.json();
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(data, null, 2) 
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ 
        type: "text", 
        text: `Network Error: ${error.message}` 
      }]
    };
  }
}

// Helper function for POST API requests
async function makePostRequest(endpoint, body = {}) {
  const url = `${API_HOMA_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': HOMA_API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        isError: true,
        content: [{ 
          type: "text", 
          text: `API Error ${response.status}: ${errorText}` 
        }]
      };
    }

    const data = await response.json();
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(data, null, 2) 
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ 
        type: "text", 
        text: `Network Error: ${error.message}` 
      }]
    };
  }
}

// Helper function for PUT API requests
async function makePutRequest(endpoint, body = {}) {
  const url = `${API_HOMA_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': HOMA_API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        isError: true,
        content: [{ 
          type: "text", 
          text: `API Error ${response.status}: ${errorText}` 
        }]
      };
    }

    const data = await response.json();
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(data, null, 2) 
      }]
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ 
        type: "text", 
        text: `Network Error: ${error.message}` 
      }]
    };
  }
}

// Helper to get patient ID
function getPatientId(providedId) {
  const id = providedId || process.env.TEST_PATIENT_ID;
  if (!id) {
    throw new Error("Patient ID is required (no provided ID and no TEST_PATIENT_ID in env)");
  }
  return id;
}

// ============================================
// PATIENTS - GET Endpoints
// ============================================

// Tool: Get All Patients
server.tool(
  "get_patients",
  "Get list of all patients",
  {},
  async () => {
    return await makeApiRequest(`/api/v1/patients`);
  }
);

// Tool: Get Patient Profile
server.tool(
  "get_patient_profile",
  "Get full profile details for a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/patients/${id}`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// Tool: Get Patient Services
server.tool(
  "get_patient_services",
  "Get the list of available services for a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/patients/${id}/services`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// Tool: Get Patient Plans
server.tool(
  "get_patient_plans",
  "Get the health plans associated with a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/patients/plans/${id}`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// Tool: Get Patient Campaigns
server.tool(
  "get_patient_campaigns",
  "Get the campaigns associated with a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/patients/${id}/campaigns`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// Tool: Get Patient More Plans
server.tool(
  "get_patient_more_plans",
  "Get additional plans for a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/patients/more_plans/${id}`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// Tool: Get Patient Audiovisual Material
server.tool(
  "get_patient_audiovisual",
  "Get audiovisual material for a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/patients/material_audiovisual/${id}`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// ============================================
// PATIENTS - POST Endpoints
// ============================================

// Tool: Create Patient
server.tool(
  "create_patient",
  "Create a new patient",
  {
    patient_data: z.object({}).passthrough().describe("Patient data object"),
  },
  async ({ patient_data }) => {
    return await makePostRequest(`/api/v1/patients`, patient_data);
  }
);

// Tool: Set Patient Campaign
server.tool(
  "set_patient_campaign",
  "Assign a campaign to a patient",
  {
    patient_id: z.string().describe("The ID of the patient"),
    campaign_id: z.string().describe("The ID of the campaign to assign"),
  },
  async ({ patient_id, campaign_id }) => {
    return await makePostRequest(`/api/v1/patients/setcampaing`, { patient_id, campaign_id });
  }
);

// Tool: Unset Patient Campaign
server.tool(
  "unset_patient_campaign",
  "Remove a campaign from a patient",
  {
    patient_id: z.string().describe("The ID of the patient"),
    campaign_id: z.string().describe("The ID of the campaign to remove"),
  },
  async ({ patient_id, campaign_id }) => {
    return await makePostRequest(`/api/v1/patients/unsetcampaing`, { patient_id, campaign_id });
  }
);

// Tool: Send Push Notification
server.tool(
  "send_push_notification",
  "Send a push notification to a patient",
  {
    patient_id: z.string().describe("The ID of the patient"),
    message: z.string().describe("The notification message"),
    title: z.string().optional().describe("The notification title"),
  },
  async ({ patient_id, message, title }) => {
    return await makePostRequest(`/api/v1/patients/sendpushnotification`, { patient_id, message, title });
  }
);

// ============================================
// PATIENTS - PUT Endpoints
// ============================================

// Tool: Update Patient Plan
server.tool(
  "update_patient_plan",
  "Update a health plan for a patient",
  {
    patient_id: z.string().describe("The ID of the patient"),
    plan_id: z.string().describe("The ID of the plan to update"),
    plan_data: z.object({}).passthrough().optional().describe("Plan data to update"),
  },
  async ({ patient_id, plan_id, plan_data }) => {
    return await makePutRequest(`/api/v1/patients/plans/${patient_id}/${plan_id}`, plan_data || {});
  }
);

// ============================================
// PROTOCOLS Endpoints
// ============================================

// Tool: Get Protocols by HealthPlan
server.tool(
  "get_protocols_by_healthplan",
  "Get protocols associated with a health plan",
  {
    healthplan_id: z.string().describe("The ID of the health plan"),
  },
  async ({ healthplan_id }) => {
    return await makeApiRequest(`/api/v1/protocols/${healthplan_id}`);
  }
);

// Tool: Get Protocol Details
server.tool(
  "get_protocol",
  "Get details of a specific protocol",
  {
    protocol_id: z.string().describe("The ID of the protocol"),
  },
  async ({ protocol_id }) => {
    return await makeApiRequest(`/api/v1/protocol/${protocol_id}`);
  }
);

// Tool: Get Protocol Observations
server.tool(
  "get_protocol_observations",
  "Get observations for a patient in a specific protocol",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
    protocol_id: z.string().describe("The ID of the protocol"),
  },
  async ({ patient_id, protocol_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/protocol/observations/${id}/${protocol_id}`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// Tool: Get Last Info Control
server.tool(
  "get_last_info_control",
  "Get the last info control for a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/protocol/last_info_control/${id}`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// Tool: Get Last Control
server.tool(
  "get_last_control",
  "Get the last control for a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/protocol/last_control/${id}`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// Tool: Get Observation Range
server.tool(
  "get_observation_range",
  "Get observation range for a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/protocol/observation_range/${id}`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// ============================================
// HEALTHPLANS Endpoints
// ============================================

// Tool: Get HealthPlans
server.tool(
  "get_healthplans",
  "Get health plans for a patient",
  {
    patient_id: z.string().optional().describe("The ID of the patient (optional if TEST_PATIENT_ID is set in env)"),
  },
  async ({ patient_id }) => {
    try {
      const id = getPatientId(patient_id);
      return await makeApiRequest(`/api/v1/healthplans/${id}`);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  }
);

// ============================================
// CAMPAIGNS Endpoints
// ============================================

// Tool: Get All Campaigns
server.tool(
  "get_all_campaigns",
  "Get all available campaigns",
  {},
  async () => {
    return await makeApiRequest(`/api/v1/campaigns/all`);
  }
);

// ============================================
// PARAMETERS Endpoints
// ============================================

// Tool: Get Parameter
server.tool(
  "get_parameter",
  "Get a specific parameter by code",
  {
    codeparam: z.string().describe("The code of the parameter to retrieve"),
  },
  async ({ codeparam }) => {
    return await makeApiRequest(`/api/v1/parameters/${codeparam}`);
  }
);

// ============================================
// SERVICES Endpoints
// ============================================

// Tool: Set Use Service
server.tool(
  "set_use_service",
  "Mark a service as used",
  {
    service_data: z.object({}).passthrough().describe("Service usage data"),
  },
  async ({ service_data }) => {
    return await makePostRequest(`/api/v1/services/setuseservice`, service_data);
  }
);

// Tool: Set Use Service ClickUp
server.tool(
  "set_use_service_clickup",
  "Mark a service as used via ClickUp",
  {
    service: z.string().describe("The service identifier"),
    document: z.string().describe("The document identifier"),
  },
  async ({ service, document }) => {
    return await makePostRequest(`/api/v1/services/setuseserviceclickup/${service}/${document}/`, {});
  }
);

// ============================================
// HANU Endpoints
// ============================================

// Tool: Activate Hanu
server.tool(
  "activate_hanu",
  "Activate Hanu service",
  {
    activation_data: z.object({}).passthrough().optional().describe("Activation data"),
  },
  async ({ activation_data }) => {
    return await makePostRequest(`/api/v1/hanu/activate`, activation_data || {});
  }
);

// ============================================
// PDMS Endpoints
// ============================================

// Tool: Activate PDMS
server.tool(
  "activate_pdms",
  "Activate PDMS service",
  {
    activation_data: z.object({}).passthrough().optional().describe("Activation data"),
  },
  async ({ activation_data }) => {
    return await makePostRequest(`/api/v1/pdms/activate`, activation_data || {});
  }
);

// ============================================
// BATCH Endpoints
// ============================================

// Tool: Get Observation Types
server.tool(
  "get_observation_types",
  "Get all observation types",
  {},
  async () => {
    return await makeApiRequest(`/api/v1/batch/observation_types`);
  }
);

// ============================================
// Start Server
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("HOMA MCP Server running on stdio - 25 tools available");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
