document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  const titles = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Welcome back! Ready to plan your next adventure?'
    },
    holidays: {
      title: 'Holidays',
      subtitle: 'Explore public holidays and plan ahead'
    },
    events: {
      title: 'Events',
      subtitle: 'Discover exciting events around you'
    },
    weather: {
      title: 'Weather',
      subtitle: 'Check the latest weather forecasts'
    },
    'long-weekends': {
      title: 'Long Weekends',
      subtitle: 'Find perfect long weekends for trips'
    },
    currency: {
      title: 'Currency Converter',
      subtitle: 'Convert currencies with ease'
    },
    'sun-times': {
      title: 'Sun Times',
      subtitle: 'Sunrise and sunset times'
    },
    'my-plans': {
      title: 'My Plans',
      subtitle: 'Your saved trips and favorites'
    }
  };

  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();

      const viewName = item.dataset.view;
      const viewId = `${viewName}-view`;

      // active tab
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // active view
      views.forEach(v => v.classList.remove('active'));
      const targetView = document.getElementById(viewId);
      if (targetView) targetView.classList.add('active');

      // update header
      if (titles[viewName]) {
        pageTitle.textContent = titles[viewName].title;
        pageSubtitle.textContent = titles[viewName].subtitle;
      }
    });
  });
});
