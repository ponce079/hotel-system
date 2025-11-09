import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Paper,
  IconButton,
  Fade,
  Slide
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  EventNote as EventNoteIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBackIos,
  ArrowForwardIos,
  Star as StarIcon,
  Spa as SpaIcon,
  LocalBar as BarIcon,
  FitnessCenter as GymIcon
} from '@mui/icons-material';

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Imágenes para el carrusel hero
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1920&q=80',
      title: 'Experiencia de Lujo',
      subtitle: 'Donde cada detalle cuenta'
    },
    {
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80',
      title: 'Confort Excepcional',
      subtitle: 'Habitaciones diseñadas para tu descanso'
    },
    {
      url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80',
      title: 'Servicios Premium',
      subtitle: 'Todo lo que necesitas, cuando lo necesitas'
    }
  ];

  // Auto-play del carrusel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const menuItems = [
    {
      title: 'Reservar',
      description: 'Nueva Reserva',
      icon: <HotelIcon sx={{ fontSize: 40 }} />,
      path: '/cliente/nueva-reserva',
      color: '#C9A86A',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80'
    },
    {
      title: 'Mis Reservas',
      description: 'Gestionar Estadías',
      icon: <EventNoteIcon sx={{ fontSize: 40 }} />,
      path: '/cliente/mis-reservas',
      color: '#8B7355',
      image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80'
    },
    {
      title: 'Servicios',
      description: 'Contratar Extras',
      icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
      path: '/cliente/contratar-servicios',
      color: '#B8956A',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80'
    },
    {
      title: 'Mis Servicios',
      description: 'Ver Contratados',
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      path: '/cliente/mis-servicios',
      color: '#A67C52',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'
    },
    {
      title: 'Consultas',
      description: 'Contactar Recepción',
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      path: '/cliente/mis-consultas',
      color: '#D4AF37',
      image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=600&q=80'
    }
  ];

  const amenities = [
    { icon: <SpaIcon />, label: 'Spa & Wellness' },
    { icon: <RestaurantIcon />, label: 'Restaurante Gourmet' },
    { icon: <BarIcon />, label: 'Bar de Cócteles' },
    { icon: <GymIcon />, label: 'Gimnasio 24/7' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      {/* Hero Carousel */}
      <Box sx={{ position: 'relative', height: { xs: '50vh', md: '70vh' }, overflow: 'hidden' }}>
        {heroImages.map((image, index) => (
          <Fade key={index} in={currentSlide === index} timeout={1000}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${image.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: currentSlide === index ? 'block' : 'none'
              }}
            >
              {/* Overlay oscuro */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))'
                }}
              />

              {/* Contenido del slide */}
              <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', zIndex: 1 }}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    color: 'white'
                  }}
                >
                  <Slide direction="right" in={currentSlide === index} timeout={800}>
                    <Box>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 300,
                          mb: 2,
                          fontSize: { xs: '2.5rem', md: '4rem' },
                          fontFamily: '"Playfair Display", serif',
                          letterSpacing: '0.02em'
                        }}
                      >
                        {image.title}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 300,
                          mb: 4,
                          opacity: 0.95,
                          fontSize: { xs: '1.2rem', md: '1.8rem' }
                        }}
                      >
                        {image.subtitle}
                      </Typography>
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate('/cliente/nueva-reserva')}
                        sx={{
                          bgcolor: '#C9A86A',
                          color: 'white',
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 400,
                          borderRadius: 0,
                          letterSpacing: '0.1em',
                          '&:hover': {
                            bgcolor: '#B8956A'
                          }
                        }}
                      >
                        RESERVAR AHORA
                      </Button>
                    </Box>
                  </Slide>
                </Box>
              </Container>
            </Box>
          </Fade>
        ))}

        {/* Controles del carrusel */}
        <IconButton
          onClick={prevSlide}
          sx={{
            position: 'absolute',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            zIndex: 2
          }}
        >
          <ArrowBackIos />
        </IconButton>
        <IconButton
          onClick={nextSlide}
          sx={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            zIndex: 2
          }}
        >
          <ArrowForwardIos />
        </IconButton>

        {/* Indicadores */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 2
          }}
        >
          {heroImages.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                width: currentSlide === index ? 40 : 12,
                height: 12,
                borderRadius: 6,
                bgcolor: currentSlide === index ? '#C9A86A' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Bienvenida elegante */}
      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 3 }}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            bgcolor: 'white',
            borderRadius: 0,
            border: '1px solid #E0E0E0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#C9A86A',
                fontSize: 32,
                fontWeight: 300,
                fontFamily: '"Playfair Display", serif'
              }}
            >
              {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 300,
                  mb: 0.5,
                  fontFamily: '"Playfair Display", serif',
                  color: '#2C2C2C'
                }}
              >
                Bienvenido de vuelta, {user?.nombre}
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', fontWeight: 300 }}>
                Es un placer tenerle con nosotros
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} sx={{ color: '#C9A86A', fontSize: 20 }} />
              ))}
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Servicios principales */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 300,
              mb: 2,
              fontFamily: '"Playfair Display", serif',
              color: '#2C2C2C'
            }}
          >
            Nuestros Servicios
          </Typography>
          <Box sx={{ width: 60, height: 2, bgcolor: '#C9A86A', mx: 'auto', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666', fontWeight: 300, maxWidth: 600, mx: 'auto' }}>
            Explore nuestra exclusiva selección de servicios diseñados para su comodidad
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: 0,
                  border: '1px solid #E0E0E0',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    '& .service-image': {
                      transform: 'scale(1.1)'
                    },
                    '& .service-overlay': {
                      opacity: 0.7
                    }
                  }
                }}
                onClick={() => navigate(item.path)}
              >
                {/* Imagen */}
                <Box
                  className="service-image"
                  sx={{
                    height: 280,
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.6s ease',
                    position: 'relative'
                  }}
                >
                  <Box
                    className="service-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: item.color,
                      opacity: 0.6,
                      transition: 'opacity 0.4s'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      textAlign: 'center'
                    }}
                  >
                    {item.icon}
                  </Box>
                </Box>

                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 400,
                      mb: 1,
                      fontFamily: '"Playfair Display", serif',
                      color: '#2C2C2C',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 300, mb: 2 }}>
                    {item.description}
                  </Typography>
                  <Button
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      color: item.color,
                      fontWeight: 400,
                      letterSpacing: '0.1em',
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: '#2C2C2C'
                      }
                    }}
                  >
                    ACCEDER
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Amenidades */}
      <Box sx={{ bgcolor: '#2C2C2C', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {amenities.map((amenity, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Box sx={{ color: '#C9A86A', mb: 2 }}>
                    {amenity.icon}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 300,
                      letterSpacing: '0.1em',
                      fontSize: '0.9rem'
                    }}
                  >
                    {amenity.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer elegante */}
      <Box sx={{ bgcolor: '#1A1A1A', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            align="center"
            sx={{
              fontWeight: 300,
              letterSpacing: '0.1em',
              opacity: 0.7
            }}
          >
            © {new Date().getFullYear()} HOTEL SISTEMA • EXPERIENCIA DE LUJO
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default ClienteDashboard;