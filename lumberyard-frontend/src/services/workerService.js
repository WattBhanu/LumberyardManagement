import API from './api';

const WorkerService = {
  getAllWorkers: async () => {
    const response = await API.get('/workers/all');
    return response;
  },

  getWorkerById: async (id) => {
    const response = await API.get(`/workers/${id}`);
    return response;
  },

  createWorker: async (workerData) => {
    const response = await API.post('/workers/add', workerData);
    return response;
  },

  updateWorker: async (id, workerData) => {
    const response = await API.put(`/workers/update/${id}`, workerData);
    return response;
  },

  deleteWorker: async (id) => {
    const response = await API.delete(`/workers/delete/${id}`);
    return response;
  }
};

export default WorkerService;
