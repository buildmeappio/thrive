import createChaperone from './handlers/createChaperone';
import updateChaperone from './handlers/updateChaperone';
import getChaperones from './handlers/getChaperones';
import getChaperoneById from './handlers/getChaperoneById';
import deleteChaperone from './handlers/deleteChaperone';

export const chaperoneHandlers = {
  createChaperone,
  updateChaperone,
  getChaperones,
  getChaperoneById,
  deleteChaperone,
};
