/* ===============================
   Countries Service
================================ */
class CountriesService {
    constructor() {
        this.apiUrl = 'https://restcountries.com/v3.1/all?fields=name,cca2,capital,flags,region';
    }

    getAllCountries() {
        return fetch(this.apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load countries');
                return response.json();
            });
    }
    // Get full country info by code
    getCountryByCode(code) {
        return fetch(`https://restcountries.com/v3.1/alpha/${code}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load country info');
                return response.json();
            });
    }
}

/* ===============================
   Holidays Service 
================================ */
class HolidaysService {
    constructor() {
        this.baseUrl = 'https://date.nager.at/api/v3/PublicHolidays';
    }

    getHolidays(year, countryCode) {
        if (!year || !countryCode) return Promise.resolve([]);
        const url = `${this.baseUrl}/${year}/${countryCode}`;
        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load holidays');
                return response.json();
            });
    }
}

/* ===============================
   Events Service
================================ */
class EventsService {
    constructor() {
        this.apiKey = 'VwECw2OiAzxVzIqnwmKJUG41FbeXJk1y';
        this.baseUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';
    }

    getEvents(city, countryCode, size = 20) {
        if (!city || !countryCode) return Promise.resolve([]);
        const url = `${this.baseUrl}?apikey=${this.apiKey}&city=${encodeURIComponent(city)}&countryCode=${countryCode}&size=${size}`;
        return fetch(url)
            .then(function (response) {
                if (!response.ok) throw new Error('Failed to load events');
                return response.json();
            })
            .then(function (data) {
                return data._embedded ? data._embedded.events : [];
            });
    }
}

/* ===============================
   Weather Service 
================================ */
class WeatherService {
    constructor() {
        this.baseUrl = 'https://api.open-meteo.com/v1/forecast';
    }

    getWeather(latitude, longitude) {
        if (!latitude || !longitude) return Promise.resolve(null);

        const params = new URLSearchParams({
            latitude,
            longitude,
            current_weather: true,
            hourly: 'temperature_2m,weather_code,precipitation_probability',
            daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,uv_index_max',
            timezone: 'auto'
        });

        const url = `${this.baseUrl}?${params.toString()}`;
        return fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load weather');
                return res.json();
            });
    }
}

/* ===============================
   Long Weekend Service
================================ */
class LongWeekendService {
    constructor() {
        this.baseUrl = 'https://date.nager.at/api/v3/LongWeekend';
    }

    getLongWeekends(year, countryCode) {
        if (!year || !countryCode) return Promise.resolve([]);
        const url = `${this.baseUrl}/${year}/${countryCode}`;

        return fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load long weekends');
                return res.json();
            });
    }
}

/* ===============================
   My Plan Service
================================ */
class FavoritesStorage {
    static get(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    static save(key, item) {
        const list = this.get(key);

        // prevent duplicates (by date range or name)
        const exists = list.some(i => JSON.stringify(i) === JSON.stringify(item));
        if (!exists) {
            list.push(item);
            localStorage.setItem(key, JSON.stringify(list));
        }
        return list.length; 

    }

    static remove(key, predicate) {
        const list = this.get(key).filter(i => !predicate(i));
        localStorage.setItem(key, JSON.stringify(list));
    }
    static clearAll() {
        localStorage.removeItem('saved_holidays');
        localStorage.removeItem('saved_long_weekends');
    }

    static count() {
        const holidays = this.get('saved_holidays').length;
        const weekends = this.get('saved_long_weekends').length;
        return holidays + weekends;
    }
}





/* ===============================
   Destination UI
================================ */
class DestinationUI {
    constructor() {
        this.$countrySelect = $('#global-country');
        this.citySelect = document.getElementById('global-city');
        this.flagImg = document.getElementById('selected-country-flag');
        this.countryName = document.getElementById('selected-country-name');
        this.cityName = document.getElementById('selected-city-name');
    }

    populateCountries(countries) {
        this.$countrySelect.empty().append(new Option('Select Country', '', false, false));

        countries.forEach(function (country) {
            const option = new Option(country.name.common, country.cca2, false, false);
            $(option).data({
                name: country.name.common,
                capital: country.capital?.[0] || '',
                flag: country.flags?.png || '',
                region: country.region
            });
            this.$countrySelect.append(option);
        }.bind(this));

        this.initSelect2();
    }

    initSelect2() {
        this.$countrySelect.select2({
            placeholder: 'Search countries...',
            allowClear: true,
            width: '100%',
            templateResult: this.formatCountry,
            templateSelection: this.formatCountry
        });
    }

    formatCountry(country) {
        if (!country.id) return country.text;
        const flag = $(country.element).data('flag');
        return $(
            '<span style="display:flex;align-items:center;gap:8px">' +
            '<img src="' + flag + '" style="width:20px;border-radius:3px">' +
            '<span>' + country.text + '</span>' +
            '</span>'
        );
    }

    updateCity(capital) {
        this.citySelect.innerHTML = capital ? '<option selected>' + capital + '</option>' : '<option>No city available</option>';
    }

    updateSelectedDestination(data) {
        if (this.flagImg) { this.flagImg.src = data.flag; this.flagImg.alt = data.name; }
        if (this.countryName) this.countryName.textContent = data.name;
        if (this.cityName) this.cityName.textContent = data.capital ? '• ' + data.capital : '';
    }
}

/* ===============================
   Stats UI
================================ */
class CountCountriesUI {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
    }

    updateCount(count) {
        if (this.element) this.element.textContent = count + '+';
    }

}

/* ===============================
   Holidays UI
================================ */
class HolidaysUI {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
    }

    updateHolidayCount(count) {
        if (this.element) this.element.textContent = count;
    }
    // the holiday page 
    renderHolidays(holidays) {
        const container = document.getElementById('holidays-content');
        if (!container) return;

        container.innerHTML = ''; // Clear previous holidays

        if (!holidays.length) {
            container.innerHTML = '<p>No public holidays found for this selection.</p>';
            return;
        }

        holidays.forEach(function (holiday) {
            const date = new Date(holiday.date);
            const day = date.getDate();
            const month = date.toLocaleString('en-US', { month: 'short' });
            const weekday = date.toLocaleString('en-US', { weekday: 'long' });

            const card = document.createElement('div');
            card.className = 'holiday-card';
            card.innerHTML = `
                <div class="holiday-card-header">
                    <div class="holiday-date-box">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <button class="holiday-action-btn active" data-holiday='${JSON.stringify(holiday)}'><i class="fa-regular fa-heart"></i></button>
                </div>
                <h3>${holiday.localName}</h3>
                <p class="holiday-name">${holiday.name}</p>
                <div class="holiday-card-footer">
                    <span class="holiday-day-badge"><i class="fa-regular fa-calendar"></i> ${weekday}</span>
                    <span class="holiday-type-badge">Public</span>
                </div>
            `;
            container.appendChild(card);
        });
    }
}



/* ===============================
   Country Info UI
================================ */
class CountryInfoUI {
    constructor() {
        this.flagImg = document.querySelector('.dashboard-country-flag');
        this.countryTitle = document.querySelector('.dashboard-country-title h3');
        this.regionSpan = document.querySelector('.dashboard-country-title .region');
        this.officialName = document.querySelector('.dashboard-country-title .official-name');

        this.grid = document.querySelectorAll('.dashboard-country-grid .dashboard-country-detail');
        this.extras = document.querySelectorAll('.dashboard-country-extra .extra-tags');
        this.mapLink = document.querySelector('.btn-map-link');
    }
    updateCountryInfo(data) {
        if (!data) return;

        // Basic info
        if (this.flagImg) { this.flagImg.src = data.flags?.png || ''; this.flagImg.alt = data.name.common || ''; }
        if (this.countryTitle) this.countryTitle.textContent = data.name.common || '';
        if (this.officialName) this.officialName.textContent = data.name.official || '';
        if (this.regionSpan) this.regionSpan.textContent = (data.region || 'N/A') + (data.subregion ? ' • ' + data.subregion : '');

        // Grid info
        if (this.grid.length) {
            this.grid[0].querySelector('.value').textContent = data.capital?.[0] || 'N/A'; // Capital
            this.grid[1].querySelector('.value').textContent = data.population?.toLocaleString() || 'N/A'; // Population
            this.grid[2].querySelector('.value').textContent = data.area ? data.area.toLocaleString() + ' km²' : 'N/A'; // Area
            this.grid[3].querySelector('.value').textContent = data.continents?.[0] || 'N/A'; // Continent
            this.grid[4].querySelector('.value').textContent = data.idd?.root ? data.idd.root + (data.idd.suffixes?.[0] || '') : 'N/A'; // Calling code
            this.grid[5].querySelector('.value').textContent = data.car?.side || 'N/A'; // Driving side
            this.grid[6].querySelector('.value').textContent = data.startOfWeek ? data.startOfWeek.charAt(0).toUpperCase() + data.startOfWeek.slice(1) : 'N/A'; // Week starts
        }

        // Extras (currency, languages, neighbors)
        if (this.extras.length) {
            // Currency
            const currencies = data.currencies ? Object.values(data.currencies).map(c => c.name + ' (' + c.symbol + ')').join(', ') : 'N/A';
            this.extras[0].innerHTML = '<span class="extra-tag">' + currencies + '</span>';

            // Languages
            const languages = data.languages ? Object.values(data.languages).join(', ') : 'N/A';
            this.extras[1].innerHTML = '<span class="extra-tag">' + languages + '</span>';

            // Borders
            const borders = data.borders ? data.borders.map(b => '<span class="extra-tag border-tag">' + b + '</span>').join('') : 'None';
            this.extras[2].innerHTML = borders;
        }

        // Map link
        if (this.mapLink) this.mapLink.href = data.maps?.googleMaps || '#';
    }
}

/* ===============================
   Events UI
================================ */
class EventsUI {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
    }

    renderEvents(events) {
        if (!this.container) return;
        this.container.innerHTML = ''; // clear old events

        if (!events.length) {
            this.container.innerHTML = '<p>No events found for this city.</p>';
            return;
        }

        events.forEach(function (event) {
            const date = event.dates?.start?.localDate || '';
            const time = event.dates?.start?.localTime || '';
            const name = event.name || '';
            const category = event.classifications?.[0]?.segment?.name || 'General';
            const venue = event._embedded?.venues?.[0]?.name || 'Unknown venue';
            const city = event._embedded?.venues?.[0]?.city?.name || '';
            const image = event.images?.[0]?.url || 'https://via.placeholder.com/400x200';
            const url = event.url || '#';

            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-card-image">
                    <img src="${image}" alt="${name}">
                    <span class="event-card-category">${category}</span>
                    <button class="event-card-save"><i class="fa-regular fa-heart"></i></button>
                </div>
                <div class="event-card-body">
                    <h3>${name}</h3>
                    <div class="event-card-info">
                        <div><i class="fa-regular fa-calendar"></i>${date} ${time}</div>
                        <div><i class="fa-solid fa-location-dot"></i>${venue}, ${city}</div>
                    </div>
                    <div class="event-card-footer">
                        <button class="btn-event"><i class="fa-regular fa-heart"></i> Save</button>
                        <a href="${url}" target="_blank" class="btn-buy-ticket"><i class="fa-solid fa-ticket"></i> Buy Tickets</a>
                    </div>
                </div>
            `;
            this.container.appendChild(card);
        });
    }
}

/* ===============================
   Weather UI
================================ */
class WeatherUI {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        this.hourlyContainer = document.getElementById('hourly-scroll');
        // Current weather elements
        this.cityEl = document.getElementById('weather-city');
        this.dateEl = document.getElementById('weather-date');
        this.iconEl = document.getElementById('weather-icon');
        this.tempEl = document.getElementById('temp-value');
        this.conditionEl = document.getElementById('weather-condition');
        this.feelsEl = document.getElementById('weather-feels');
        this.highEl = document.getElementById('weather-high');
        this.lowEl = document.getElementById('weather-low');
        this.humidityEl = document.getElementById('weather-humidity');
        this.windEl = document.getElementById('weather-wind');

    }

    updateWeather(data, cityName) {
        console.log(data);
        if (!this.container || !data) return;

        // Current weather
        const current = data.current_weather;
        this.container.querySelector('.weather-location span').textContent = cityName;
        this.container.querySelector('.weather-hero-temp .temp-value').textContent = current.temperature.toFixed(0);
        this.container.querySelector('.weather-condition').textContent = this.getWeatherDescription(current.weathercode);
        this.container.querySelector('.weather-feels').textContent = `Feels like ${current.temperature.toFixed(0)}°C`;
        // You can also map icons based on weathercode

        // 7-day forecast
        const forecastList = this.container.querySelector('.forecast-list');

        forecastList.innerHTML = ''; // clear old
        if (data.daily) {
            for (let i = 0; i < data.daily.time.length; i++) {
                const dayHtml = `
                <div class="forecast-day">
                    <div class="forecast-day-name">
                        <span class="day-label">${i === 0 ? 'Today' : 'Day ' + i}</span>
                        <span class="day-date">${new Date(data.daily.time[i]).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div class="forecast-icon"><i class="fa-solid fa-sun"></i></div>
                    <div class="forecast-temps">
                        <span class="temp-max">${data.daily.temperature_2m_max[i].toFixed(0)}°</span>
                        <span class="temp-min">${data.daily.temperature_2m_min[i].toFixed(0)}°</span>
                    </div>
                    <div class="forecast-precip">${data.daily.precipitation_sum[i]} mm</div>
                </div>`;
                forecastList.insertAdjacentHTML('beforeend', dayHtml);
            }
        }

        // Update Hourly Forecast
        this.renderHourly(data.hourly);
        // this.updateCurrentWeather(data.current_weather)

    }


    updateCurrentWeather(current) {
        if (!current) return;

        const temp = current.temperature;
        // const humidity = Math.round(current.humidity);
        const wind = current.windspeed;
        const condition = this.getWeatherCondition(current.weathercode);
        const iconClass = this.getWeatherIcon(current.weathercode);

        // Update DOM
        this.tempEl.textContent = temp;
        this.conditionEl.textContent = condition;
        this.windEl.textContent = wind + ' km/h';
        this.iconEl.innerHTML = `<i class="${iconClass}"></i>`;
    }
    renderHourly(hourlyData) {

        if (!this.hourlyContainer || !hourlyData) return;

        this.hourlyContainer.innerHTML = ''; // clear previous

        // Assume hourlyData has arrays: time, temperature, weathercode
        for (let i = 0; i < 8; i++) { // first 8 hours
            console.log(hourlyData.time[i], hourlyData.temperature_2m[i], hourlyData.weather_code[i])
            const hourLabel = this.formatHour(hourlyData.time[i]);
            const temp = Math.round(hourlyData.temperature_2m[i]);
            const iconClass = this.getWeatherIcon(hourlyData.weather_code[i]);

            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-item' + (i === 0 ? ' now' : '');
            hourlyItem.innerHTML = `
                <span class="hourly-time">${hourLabel}</span>
                <div class="hourly-icon"><i class="${iconClass}"></i></div>
                <span class="hourly-temp">${temp}°</span>
            `;

            this.hourlyContainer.appendChild(hourlyItem);
        }
    }

    // Convert API time string to hour label
    formatHour(timeStr) {
        const date = new Date(timeStr);
        const hours = date.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;
        return hour12 + ' ' + ampm;
    }

    // Map weather codes to icons
    getWeatherIcon(code) {
        // Simple example, expand based on Open-Meteo codes
        if (code === 0) return 'fa-solid fa-sun'; // Clear
        if (code === 1 || code === 2) return 'fa-solid fa-cloud-sun'; // Partly cloudy
        if (code >= 3 && code <= 49) return 'fa-solid fa-cloud'; // Cloudy
        if (code >= 50) return 'fa-solid fa-cloud-showers-heavy'; // Rain
        return 'fa-solid fa-sun';
    }
    getWeatherCondition(code) {
        if (code === 0) return 'Clear';
        if (code === 1 || code === 2) return 'Partly Cloudy';
        if (code >= 3 && code <= 49) return 'Cloudy';
        if (code >= 50) return 'Rain';
        return 'Clear';
    }

    getWeatherDescription(code) {
        const mapping = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing rime fog',
            51: 'Drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            56: 'Freezing drizzle',
            57: 'Dense freezing drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            66: 'Freezing rain',
            67: 'Heavy freezing rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };
        return mapping[code] || 'Unknown';
    }

}
/* ===============================
   Long Weekend UI
================================ */
class LongWeekendUI {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
    }

    renderLongWeekends(weekends) {

        if (!this.container) return;

        this.container.innerHTML = '';

        if (!weekends.length) {
            this.container.innerHTML = '<p>No long weekends found.</p>';
            return;
        }

        weekends.forEach((item, index) => {
            const infoClass = item.needBridgeDay ? 'warning' : 'success';
            const infoText = item.needBridgeDay
                ? 'Requires taking a bridge day off'
                : 'No extra days off needed!';

            const card = document.createElement('div');
            card.className = 'lw-card';
            card.innerHTML = `
                <div class="lw-card-header">
                    <span class="lw-badge">
                        <i class="fa-solid fa-calendar-days"></i> ${item.dayCount} Days
                    </span>
                    <button 
    class="longWeekends-action-btn"
    data-weekend='${JSON.stringify(item)}'>
    <i class="fa-regular fa-heart"></i>
</button>
                </div>

                <h3>Long Weekend #${index + 1}</h3>

                <div class="lw-dates">
                    <i class="fa-regular fa-calendar"></i>
                    ${this.formatDate(item.startDate)} - ${this.formatDate(item.endDate)}
                </div>

                <div class="lw-info-box ${infoClass}">
                    <i class="fa-solid fa-info-circle"></i> ${infoText}
                </div>
            `;
            this.container.appendChild(card);
        });
    }

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}

/* ===============================
   View Header UI
================================ */
class ViewHeaderUI {
    constructor() {
        this.flag = document.querySelector('.selection-flag');
        this.country = document.querySelector('.header-country');
        this.year = document.querySelector('.selection-year');
    }

    update({ countryName, countryCode, year }) {
        if (this.flag) {
            this.flag.src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
            this.flag.alt = countryName;
        }
        if (this.country) this.country.textContent = countryName;
        if (this.year) this.year.textContent = year;
    }
}

class PlansBadgeUI {
    constructor(badgeId) {
        this.badgeEl = document.getElementById(badgeId);
    }

    update(count) {
        if (!this.badgeEl) return;

        if (count > 0) {
            this.badgeEl.textContent = count;
            this.badgeEl.classList.remove('hidden');
        } else {
            this.badgeEl.textContent = 0;
            this.badgeEl.classList.add('hidden');
        }
    }
}

class MyPlansUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        this.allCountEl = document.getElementById('filter-all-count');
        this.holidayCountEl = document.getElementById('filter-holiday-count');
        this.lwCountEl = document.getElementById('filter-lw-count');
    }

    render(filter = 'all') {
        const holidays = FavoritesStorage.get('saved_holidays');
        const longWeekends = FavoritesStorage.get('saved_long_weekends');

        const allPlans = [
            ...holidays.map(h => ({ ...h, type: 'holiday' })),
            ...longWeekends.map(lw => ({ ...lw, type: 'longweekend' }))
        ];

        this.updateCounters(holidays.length, longWeekends.length);

        const filtered =
            filter === 'all'
                ? allPlans
                : allPlans.filter(p => p.type === filter);

        if (!filtered.length) {
            this.renderEmpty();
            return;
        }

        this.container.innerHTML = '';
        filtered.forEach(plan => {
            this.container.appendChild(this.createCard(plan));
        });
    }

    updateCounters(holidayCount, lwCount) {
        this.holidayCountEl.textContent = holidayCount;
        this.lwCountEl.textContent = lwCount;
        this.allCountEl.textContent = holidayCount + lwCount;
    }

    renderEmpty() {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-solid fa-heart-crack"></i></div>
                <h3>No Saved Plans Yet</h3>
                <p>Start exploring and save holidays or long weekends you like!</p>
            </div>
        `;
    }

    // createCard(plan) {
    //     const div = document.createElement('div');
    //     div.className = 'plan-card';

    //     if (plan.type === 'holiday') {
    //         div.innerHTML = `
    //             <div class="plan-card-type holiday">Holiday</div>
    //             <h4>${plan.name}</h4>
    //             <p>${plan.localName}</p>
    //             <span class="plan-date">${plan.date}</span>
    //             <span class="plan-country">${plan.countryCode}</span>
    //         `;
    //     } else {
    //         div.innerHTML = `
    //             <div class="plan-card-type  longweekend">Long Weekend</div>
    //             <h4>${plan.startDate} → ${plan.endDate}</h4>
    //             <p>${plan.dayCount} days</p>
    //             ${plan.needBridgeDay ? '<span class="bridge">Bridge Day Needed</span>' : ''}
    //         `;
    //     }

    //     return div;
    // }
    createCard(plan) {
        const div = document.createElement('div');
        div.className = 'plan-card';

        if (plan.type === 'holiday') {
            div.innerHTML = `
            <div class="plan-card-type holiday">Holiday</div>
                        <div class="plan-card-content">

            <h4>${plan.name}</h4>
            <p>${plan.localName}</p>
            <span class="plan-date">${plan.date}</span>
            <span class="plan-country">${plan.countryCode}</span>
            </div>
            <div class="plan-card-actions">
                <button class="btn-plan-remove"><i class="fa-solid fa-trash"></i> Remove</button>
            </div>
        `;

            // Remove action
            div.querySelector('.btn-plan-remove').addEventListener('click', () => {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "This plan will be removed!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, remove it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // إزالة العنصر من storage
                        if (plan.type === 'holiday') {
                            FavoritesStorage.remove('saved_holidays', h =>
                                h.name === plan.name && h.date === plan.date && h.countryCode === plan.countryCode
                            );
                        } else {
                            FavoritesStorage.remove('saved_long_weekends', lw =>
                                lw.startDate === plan.startDate && lw.endDate === plan.endDate
                            );
                        }

                        // تحديث الكروت والعداد
                        this.render();
                                        self.updatePlansBadge();       
                        Swal.fire(
                            'Removed!',
                            'Your plan has been removed.',
                            'success'
                        );
                    }
                });
            });

        } else {
            div.innerHTML = `
            <div class="plan-card-type longweekend">Long Weekend</div>
            <div class="plan-card-content">
            <h4>${plan.startDate} → ${plan.endDate}</h4>
            <p>${plan.dayCount} days</p>
            ${plan.needBridgeDay ? '<span class="bridge">Bridge Day Needed</span>' : ''}
            </div>
            <div class="plan-card-actions">
                <button class="btn-plan-remove"><i class="fa-solid fa-trash"></i> Remove</button>
            </div>
        `;

            // Remove action
            // div.querySelector('.btn-plan-remove').addEventListener('click', () => {
            //     // FavoritesStorage.remove('saved_long_weekends', lw =>
            //     //     lw.startDate === plan.startDate && lw.endDate === plan.endDate
            //     // );
            //     // this.render(); // إعادة عرض الكروت
            //     // داخل btn-plan-remove event
            div.querySelector('.btn-plan-remove').addEventListener('click', () => {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "This plan will be removed!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, remove it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // إزالة العنصر من storage
                        if (plan.type === 'holiday') {
                            FavoritesStorage.remove('saved_holidays', h =>
                                h.name === plan.name && h.date === plan.date && h.countryCode === plan.countryCode
                            );
                        } else {
                            FavoritesStorage.remove('saved_long_weekends', lw =>
                                lw.startDate === plan.startDate && lw.endDate === plan.endDate
                            );
                        }

                        // تحديث الكروت والعداد
                        this.render();
                                        self.updatePlansBadge();       

                        Swal.fire(
                            'Removed!',
                            'Your plan has been removed.',
                            'success'
                        );
                    }
                });
            });

            // });
        }

        return div;
    }

}







/* ===============================
   App Controller
================================ */
class AppController {
    constructor(service, destinationUI, countUI, holidaysService, holidaysUI, countryInfoUI, eventsService, eventsUI, weatherService, weatherUI, longWeekendService,
        longWeekendUI, viewHeaderUI) {
        this.service = service;
        this.destinationUI = destinationUI;
        this.countUI = countUI;
        this.holidaysService = holidaysService;
        this.holidaysUI = holidaysUI;
        this.countryInfoUI = countryInfoUI;
        this.eventsService = eventsService;
        this.eventsUI = eventsUI;
        this.weatherService = weatherService;
        this.weatherUI = weatherUI;
        this.longWeekendService = longWeekendService;
        this.longWeekendUI = longWeekendUI;
        this.viewHeaderUI = viewHeaderUI;


        this.countries = [];
        this.selectedCountryCode = null;
        this.selectedCity = null;
        this.plansBadgeUI = new PlansBadgeUI('plans-count');
        this.myPlansUI = new MyPlansUI('plans-content');


    }

    updatePlansBadge() {
        const total = FavoritesStorage.count();
        this.plansBadgeUI.update(total);
    }

    init() {
        const self = this;

        // Load countries
        this.service.getAllCountries()
            .then(function (countries) {
                self.countries = countries;
                self.destinationUI.populateCountries(countries);
                self.countUI.updateCount(countries.length);
                self.bindEvents();
                self.updatePlansBadge();

            })
            .catch(function (error) {
                console.error(error);
            });

    }

    bindEvents() {
        const self = this;

        // Country selected
        this.destinationUI.$countrySelect.on('select2:select', function (e) {
            const selected = e.params.data.element;
            const countryData = {
                name: $(selected).data('name'),
                capital: $(selected).data('capital'),
                flag: $(selected).data('flag'),
                code: $(selected).val(),
                region: $(selected).data('region')
            };

            self.selectedCountryCode = countryData.code;
            self.selectedCity = countryData.capital;


            self.destinationUI.updateCity(countryData.capital);
            self.destinationUI.updateSelectedDestination(countryData);
            self.countryInfoUI.updateCountryInfo(countryData);

            const year = document.getElementById('global-year').value;
            self.viewHeaderUI.update({
                countryName: countryData.name,
                countryCode: countryData.code,
                year: year
            });
            self.viewHeaderUI.update({
                countryName: document.getElementById('header-country').textContent,
                countryCode: self.selectedCountryCode,
                year: e.target.value
            });

            if (self.selectedCountryCode) {
                self.holidaysService.getHolidays(year, self.selectedCountryCode)
                    .then(function (holidays) {
                        self.holidaysUI.updateHolidayCount(holidays.length);
                    })
                    .catch(function (error) { });
            }
        });

        // Country cleared
        this.destinationUI.$countrySelect.on('select2:clear', function () {
            self.selectedCountryCode = null;
            self.destinationUI.updateCity('');
            self.destinationUI.updateSelectedDestination({ name: '', capital: '', flag: '', code: '', region: '' });
            self.countryInfoUI.updateCountryInfo({ name: '', flag: '', region: '' });
            self.holidaysUI.updateHolidayCount(0);
        });

        // Year changed
        document.getElementById('global-year').addEventListener('change', function (e) {
            const year = e.target.value;
            if (self.selectedCountryCode) {
                self.holidaysService.getHolidays(year, self.selectedCountryCode)
                    .then(function (holidays) { self.holidaysUI.updateHolidayCount(holidays.length); })
                    .catch(function (error) { console.error(error); });
            }
        });

        // Explore button
        document.getElementById('global-search-btn').addEventListener('click', function () {
            if (!self.selectedCountryCode) return alert('Please select a country');
            const year = document.getElementById('global-year').value;

            // Update country info
            // 1️⃣ Update country info
            self.service.getCountryByCode(self.selectedCountryCode)
                .then(function (fullData) {
                    const country = fullData[0];
                    self.countryInfoUI.updateCountryInfo(country);

                    // Update Weather
                    const capital = country.capital?.[0];
                    const lat = country.latlng?.[0];
                    const lng = country.latlng?.[1];

                    if (capital && lat && lng) {
                        self.weatherService.getWeather(lat, lng)
                            .then(weatherData => {
                                self.weatherUI.updateWeather(weatherData, capital);
                            })
                            .catch(err => console.error('Weather fetch failed', err));
                    }
                })
                .catch(function (err) { console.error(err); });

            self.holidaysService.getHolidays(year, self.selectedCountryCode)
                .then(function (holidays) {
                    self.holidaysUI.updateHolidayCount(holidays.length);
                    self.holidaysUI.renderHolidays(holidays); // render holiday page  cards dynamically

                    // alert('There are ' + holidays.length + ' public holidays in ' + self.selectedCountryCode + ' for ' + year);
                })
                .catch(function (error) {
                    console.error(error);
                    alert('Failed to fetch holidays');
                });

            // Events
            if (self.selectedCity) {
                self.eventsService.getEvents(self.selectedCity, self.selectedCountryCode)
                    .then(function (events) {
                        self.eventsUI.renderEvents(events);


                    })
                    .catch(function (err) { console.error(err); });
            }
            // Long Weekends
            self.longWeekendService
                .getLongWeekends(year, self.selectedCountryCode)
                .then(weekends => {
                    self.longWeekendUI.renderLongWeekends(weekends);
                })
                .catch(err => console.error(err));
        });

        // save at the loacal stoage  Holiday

        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.holiday-action-btn');
            if (!btn || !btn.dataset.holiday) return;

            const holiday = JSON.parse(btn.dataset.holiday);

            FavoritesStorage.save('saved_holidays', {
                name: holiday.name,
                localName: holiday.localName,
                date: holiday.date,
                countryCode: holiday.countryCode
            });
            self.updatePlansBadge();


            btn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
        });

        //         // save at the loacal stoage  LongWeekEnd

        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.longWeekends-action-btn');
            if (!btn || !btn.dataset.weekend) return;

            const weekend = JSON.parse(btn.dataset.weekend);

            FavoritesStorage.save('saved_long_weekends', {
                startDate: weekend.startDate,
                endDate: weekend.endDate,
                dayCount: weekend.dayCount,
                needBridgeDay: weekend.needBridgeDay
            });
            self.updatePlansBadge();


            btn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
        });

        document.querySelectorAll('.plan-filter').forEach(btn => {
            btn.addEventListener('click', e => {
                document
                    .querySelectorAll('.plan-filter')
                    .forEach(b => b.classList.remove('active'));

                btn.classList.add('active');

                const filter = btn.dataset.filter;
                self.myPlansUI.render(filter);
            });
        });
        // Nav link to My Plans
        document.querySelectorAll('a[data-view="my-plans"]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();

                // 1️⃣ set "All" filter active
                const allBtn = document.querySelector('.plan-filter[data-filter="all"]');
                if (allBtn) {
                    document.querySelectorAll('.plan-filter').forEach(b => b.classList.remove('active'));
                    allBtn.classList.add('active');

                    // 2️⃣ render all plans
                    self.myPlansUI.render('all');
                }

                // 3️⃣ show the My Plans section, hide others if لازم
                document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
                const myPlansView = document.getElementById('my-plans-view');
                if (myPlansView) myPlansView.classList.remove('hidden');
            });
        });


        const clearBtn = document.getElementById('clear-all-plans-btn');

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "All your saved plans will be deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, clear all!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                FavoritesStorage.clearAll();

                self.myPlansUI.render();

                self.updatePlansBadge();

                Swal.fire(
                    'Cleared!',
                    'All your saved plans have been removed.',
                    'success'
                );
            }
        });
    });
}




    }



}

/* ===============================
   Init App
================================ */
document.addEventListener('DOMContentLoaded', function () {
    const service = new CountriesService();
    const destinationUI = new DestinationUI();
    const countUI = new CountCountriesUI('stat-countries');
    const holidaysService = new HolidaysService();
    const holidaysUI = new HolidaysUI('stat-holidays'); // div in your country info section
    const countryInfoUI = new CountryInfoUI();
    const eventsService = new EventsService();
    const eventsUI = new EventsUI('events-content'); // event page 
    const weatherService = new WeatherService();
    const weatherUI = new WeatherUI('weather-content'); // event page 
    const longWeekendService = new LongWeekendService();
    const longWeekendUI = new LongWeekendUI('lw-content');
    const viewHeaderUI = new ViewHeaderUI();




    const app = new AppController(service, destinationUI, countUI, holidaysService, holidaysUI, countryInfoUI, eventsService,
        eventsUI, weatherService, weatherUI, longWeekendService, longWeekendUI, viewHeaderUI);
    app.init();
});
