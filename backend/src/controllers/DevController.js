const axios = require('axios');

const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

module.exports = {
  async index(req, res) {
    const devs = await Dev.find();

    return res.json(devs);
  },
  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username });
    if(!dev) {
      const apiRes = await axios.get(`https://api.github.com/users/${github_username}`);
  
      const { name = login, avatar_url, bio } = apiRes.data;
  
      const techsArray = parseStringAsArray(techs);
    
      const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      }
    
      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location,
      });

      const sendSocketMessageTo = findConnections(
        { latitude, longitude },
        techsArray,
      )
      
      sendMessage(sendSocketMessageTo, 'new-dev', dev);
    }    
  
    return res.json(dev);
  },
  async update(req, res) {
    const { name, avatar_url, bio, techs, latitude, longitude } = req.body;
    const { id } = req.params;

    const techsArray = parseStringAsArray(techs);
    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    }

    const dev = await Dev.findOneAndUpdate(
      {
        _id: id,
      },
      {
        name,
        bio,
        avatar_url,
        techs: techsArray,
        location,
      },
      {
        new: true,
      }
    )

    return res.json({
      dev,
    });
  },
  async destroy(req, res) {
    const { id } = req.params;

    const result = await Dev.deleteOne({ _id: id });

    console.log(result);

    if (result.deletedCount === 1) {
      return res.json({
        message: 'Dev deletado com sucesso',
      })
    }

    return res.json({
      message: 'Não foi possível deletar o dev.',
    });
  }
}