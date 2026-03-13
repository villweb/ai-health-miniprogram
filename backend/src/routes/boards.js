const express = require('express');
const router = express.Router();

// 24节气养生内容
const solarTermsContent = require('../data/solar-terms-content.json');

// 食疗方案内容
const dietPlanContent = require('../data/diet-plan-content.json');

// 健康养生操内容
const healthExerciseContent = require('../data/health-exercise-content.json');

/**
 * GET /api/boards
 * 获取功能板块列表
 */
router.get('/', (req, res) => {
  const boards = [
    {
      id: 'board_001',
      code: 'solar_terms',
      title: '24节气养生',
      icon: '/images/solar.png',
      description: '根据节气调整饮食起居',
      type: 'qa'
    },
    {
      id: 'board_002',
      code: 'diet_plan',
      title: '食疗方案推荐',
      icon: '/images/diet.png',
      description: '对症食疗，吃出健康',
      type: 'qa'
    },
    {
      id: 'board_003',
      code: 'health_exercise',
      title: '健康养生操',
      icon: '/images/exercise.png',
      description: '传统养生功法',
      type: 'video'
    }
  ];
  
  res.json({
    code: 0,
    message: 'success',
    data: { boards }
  });
});

/**
 * GET /api/boards/:code
 * 获取板块详情
 */
router.get('/:code', (req, res) => {
  const { code } = req.params;
  
  // 板块基础信息
  const boardDetails = {
    solar_terms: {
      id: 'board_001',
      code: 'solar_terms',
      title: '24节气养生',
      icon: '/images/solar.png',
      description: '根据节气调整饮食起居',
      type: 'qa',
      content: solarTermsContent.content
    },
    diet_plan: {
      id: 'board_002',
      code: 'diet_plan',
      title: '食疗方案推荐',
      icon: '/images/diet.png',
      description: '对症食疗，吃出健康',
      type: 'qa',
      content: dietPlanContent.content
    },
    health_exercise: {
      id: 'board_003',
      code: 'health_exercise',
      title: '健康养生操',
      icon: '/images/exercise.png',
      description: '传统养生功法',
      type: 'video',
      content: healthExerciseContent.content
    }
  };
  
  const board = boardDetails[code];
  
  if (!board) {
    return res.status(404).json({
      code: 1004,
      message: '板块不存在'
    });
  }
  
  res.json({
    code: 0,
    message: 'success',
    data: board
  });
});

module.exports = router;
