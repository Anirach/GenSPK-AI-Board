import prisma from '../config/database.js';
import getOpenAI from '../config/openai.js';

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 10, boardId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id
    };

    if (boardId) {
      where.boardId = boardId;
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          board: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          _count: {
            select: {
              messages: true
            }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              type: true,
              createdAt: true,
              persona: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.conversation.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        conversations: conversations.map(conv => ({
          ...conv,
          messageCount: conv._count.messages,
          lastMessage: conv.messages[0] || null
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// Get a single conversation by ID
export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { messageLimit = 50, messageOffset = 0 } = req.query;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        board: {
          include: {
            boardPersonas: {
              include: {
                persona: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                    avatar: true,
                    expertise: true,
                    mindset: true,
                    personality: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        messages: {
          skip: parseInt(messageOffset),
          take: parseInt(messageLimit),
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            persona: {
              select: {
                id: true,
                name: true,
                role: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user has access to this conversation
    if (conversation.userId !== req.user.id && !conversation.board.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Format the response
    const formattedConversation = {
      ...conversation,
      board: {
        ...conversation.board,
        personas: conversation.board.boardPersonas.map(bp => ({
          ...bp.persona,
          expertise: JSON.parse(bp.persona.expertise || '[]')
        }))
      },
      messageCount: conversation._count.messages
    };

    delete formattedConversation.board.boardPersonas;

    res.json({
      success: true,
      data: { conversation: formattedConversation }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const { title, context, boardId } = req.body;

    // Check if board exists and user has access
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: {
        id: true,
        userId: true,
        isPublic: true
      }
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    if (board.userId !== req.user.id && !board.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this board'
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        title,
        context: context || null,
        userId: req.user.id,
        boardId
      },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: { conversation }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message
    });
  }
};

// Update a conversation
export const updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, context } = req.body;

    // Check if conversation exists and user owns it
    const existingConversation = await prisma.conversation.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingConversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (existingConversation.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you can only update your own conversations'
      });
    }

    const conversation = await prisma.conversation.update({
      where: { id },
      data: {
        title: title || undefined,
        context: context !== undefined ? context : undefined
      },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Conversation updated successfully',
      data: { conversation }
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating conversation',
      error: error.message
    });
  }
};

// Delete a conversation
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if conversation exists and user owns it
    const existingConversation = await prisma.conversation.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingConversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (existingConversation.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you can only delete your own conversations'
      });
    }

    await prisma.conversation.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: error.message
    });
  }
};

// Add message to conversation
export const addMessage = async (req, res) => {
  try {
    const { id } = req.params; // conversation id
    const { content, type, personaId } = req.body;

    // Check if conversation exists and user has access
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        board: {
          select: {
            userId: true,
            isPublic: true
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check access permissions
    if (conversation.userId !== req.user.id && !conversation.board.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Validate persona exists if provided
    if (personaId) {
      const persona = await prisma.persona.findUnique({
        where: { id: personaId }
      });

      if (!persona) {
        return res.status(404).json({
          success: false,
          message: 'Persona not found'
        });
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        type: type || 'USER',
        conversationId: id,
        userId: type === 'USER' ? req.user.id : null,
        personaId: type === 'PERSONA' ? personaId : null
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        persona: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true
          }
        }
      }
    });

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params; // conversation id
    const { limit = 50, offset = 0, before, after } = req.query;

    // Check if conversation exists and user has access
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        board: {
          select: {
            userId: true,
            isPublic: true
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.userId !== req.user.id && !conversation.board.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Build where clause for messages
    const where = { conversationId: id };
    
    if (before) {
      where.createdAt = { lt: new Date(before) };
    }
    
    if (after) {
      where.createdAt = { gt: new Date(after) };
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip: parseInt(offset),
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          persona: {
            select: {
              id: true,
              name: true,
              role: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.message.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total,
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { id, messageId } = req.params;

    // Check if message exists and belongs to the conversation
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId: id
      },
      include: {
        conversation: {
          select: { userId: true }
        }
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user owns the conversation
    if (message.conversation.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you can only delete messages from your own conversations'
      });
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// Generate AI response from board personas
export const generateAIResponse = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { message, conversationId, selectedPersonaIds } = req.body;

    // Verify board access
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        boardPersonas: {
          include: {
            persona: true
          }
        }
      }
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check access permissions
    if (!board.isPublic && board.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this board'
      });
    }

    // Get conversation context if provided
    let conversationHistory = [];
    if (conversationId) {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        include: {
          persona: true,
          user: true
        },
        orderBy: { createdAt: 'asc' },
        take: 10 // Last 10 messages for context
      });

      conversationHistory = messages.map(msg => ({
        role: msg.type === 'USER' ? 'user' : 'assistant',
        content: msg.type === 'USER' 
          ? msg.content 
          : `${msg.persona?.name}: ${msg.content}`
      }));
    }

    // Filter personas to respond (either selected ones or all if none specified)
    const personasToRespond = selectedPersonaIds && selectedPersonaIds.length > 0
      ? board.boardPersonas.filter(bp => selectedPersonaIds.includes(bp.persona.id))
      : board.boardPersonas.slice(0, 3); // Limit to 3 personas for performance

    const responses = [];

    // Generate response for each persona
    for (const boardPersona of personasToRespond) {
      const persona = boardPersona.persona;
      
      // Create persona-specific system prompt
      const systemPrompt = `You are ${persona.name}, ${persona.role}. 
        ${persona.description || ''}
        
        Your personality: ${persona.personality || persona.mindset || 'Professional and helpful'}
        Your expertise: ${persona.expertise || persona.role}
        
        Respond as this persona would, staying in character. Keep responses concise (2-3 sentences) and actionable. 
        Focus on insights relevant to your expertise area.`;

      try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: message }
          ],
          max_tokens: 200,
          temperature: 0.7
        });

        const aiResponse = completion.choices[0]?.message?.content || "I'm thinking about your question...";
        
        responses.push({
          personaId: persona.id,
          personaName: persona.name,
          response: aiResponse
        });

      } catch (aiError) {
        console.error(`AI response error for ${persona.name}:`, aiError);
        responses.push({
          personaId: persona.id,
          personaName: persona.name,
          response: `As ${persona.name}, I'd be happy to help with that. Could you provide more context about your specific situation?`
        });
      }
    }

    res.json({
      success: true,
      message: 'AI responses generated successfully',
      data: { responses }
    });

  } catch (error) {
    console.error('Generate AI response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating AI response',
      error: error.message
    });
  }
};

// Generate conversation summary
export const generateConversationSummary = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { format = 'detailed' } = req.body; // 'detailed' or 'executive'

    // Verify conversation exists and user has access
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: req.user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        board: {
          include: {
            boardPersonas: {
              include: {
                persona: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No messages found in conversation'
      });
    }

    // Prepare conversation text for summarization
    const personas = conversation.board.boardPersonas.map(bp => bp.persona);
    const conversationText = conversation.messages
      .map(message => {
        if (message.type === 'USER') {
          return `User: ${message.content}`;
        } else if (message.type === 'PERSONA') {
          const persona = personas.find(p => p.id === message.personaId);
          return `${persona ? persona.name : 'Advisor'}: ${message.content}`;
        }
        return message.content;
      })
      .join('\n\n');

    // Create summary prompt based on format
    const summaryPrompt = format === 'executive' 
      ? `Please provide an executive summary of this AI boardroom conversation. Focus on:
- Key decisions made
- Main recommendations from advisors
- Action items identified
- Strategic insights

Keep it concise and business-focused (max 300 words).

Conversation:
${conversationText}`
      : `Please provide a detailed summary of this AI boardroom conversation including:
- Overview of topics discussed
- Key insights from each advisor
- Recommendations and strategic advice given
- Important decisions or conclusions reached
- Next steps or action items mentioned

Conversation:
${conversationText}`;

    try {
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are an expert executive assistant specializing in meeting summaries and strategic analysis. Provide clear, well-structured summaries that highlight key business insights." 
          },
          { role: "user", content: summaryPrompt }
        ],
        max_tokens: format === 'executive' ? 400 : 800,
        temperature: 0.3
      });

      const summary = completion.choices[0]?.message?.content || "Unable to generate summary.";

      // Prepare response data
      const summaryData = {
        conversationId: conversation.id,
        conversationTitle: conversation.title,
        boardName: conversation.board.name,
        date: conversation.createdAt.toISOString().split('T')[0],
        participants: personas.map(p => p.name),
        messageCount: conversation.messages.length,
        summary: summary,
        format: format,
        generatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: summaryData
      });

    } catch (aiError) {
      console.error('AI summary generation error:', aiError);
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI summary',
        error: aiError.message
      });
    }

  } catch (error) {
    console.error('Generate conversation summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate conversation summary',
      error: error.message
    });
  }
};