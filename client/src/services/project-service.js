import backendApiClient from "./backendAPIClient.js";

class ProjectService {
  static normalizeProject(p) {
    return { type: "interview", ...p };
  }

  static async getAll() {
    try {
      const response = await backendApiClient.get("/projects");
      return (response.data.projects || []).map(ProjectService.normalizeProject);
    } catch (error) {
      console.error("ProjectService: Error fetching projects:", error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const response = await backendApiClient.get(`/projects/${id}`);
      return ProjectService.normalizeProject(response.data.project);
    } catch (error) {
      console.error("ProjectService: Error fetching project:", error);
      throw error;
    }
  }

  static async save(name, questions, metadata) {
    try {
      const response = await backendApiClient.post("/projects", {
        name,
        questions,
        type: metadata.type || "interview",
        ...metadata,
      });
      return response.data;
    } catch (error) {
      console.error("ProjectService: Error saving project:", error);
      throw error;
    }
  }

  static async delete(projectId) {
    try {
      const response = await backendApiClient.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error("ProjectService: Error deleting project:", error);
      throw error;
    }
  }
}

export default ProjectService;
