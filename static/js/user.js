console.log('user here babe');

function userData(username) {
    fetch('/api/profile/' + username)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let calender = data['userCalender']['submissionCalender'];
            console.log(calender);
            renderCalender(calender);
        })
}


function renderCalender(calender, date = new Date('YYYY-MM-DD')) {
    const cal = new CalHeatmap();
    cal.paint({
        range: 12,
        domain: { type: 'month' },
        subDomain: { type: 'day' },
        date: { start: new Date('2023-06-10') },
        scale: {
            color: {
                type: 'linear',
                domain: [-1, 10],
                scheme: 'YlOrRd',
            },
        },
        data: {
            source: calender,
            type: 'json',
            x: 'date',
            y: 'count',
        },
        theme: 'dark'
    },
    [[
        Tooltip,
        {
          text: function (date, value, dayjsDate) {
            return (
              (value ? value + ' Submissions' : 'No data') + ' on ' + dayjsDate.format('MMM D, YYYY')
            );
          },
        },
      ],
    ]

);

document.getElementById("prev").addEventListener('click', (e) => {
    e.preventDefault();
    cal.previous();
});

document.getElementById("next").addEventListener('click', (e) => {
    e.preventDefault();
    cal.next();
});

};

userData(username)



