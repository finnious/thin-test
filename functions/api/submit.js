export async function onRequestPost(context) {
    const { request, env } = context;
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const data = await request.json();
        
        if (!data.first_name || !data.email) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing required fields' }),
                { status: 400, headers: corsHeaders }
            );
        }

        // GHL v2 API endpoint with Private Integration
        const ghlResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.GHL_API_KEY}`,
                'Content-Type': 'application/json',
                'Version': '2021-07-28'
            },
            body: JSON.stringify({
                locationId: env.GHL_LOCATION_ID,
                firstName: data.first_name,
                email: data.email,
                tags: ['Test-Form'],
                source: 'Thin Test Site'
            })
        });

        if (!ghlResponse.ok) {
            const error = await ghlResponse.text();
            console.error('GHL Error:', error);
            return new Response(
                JSON.stringify({ success: false, error: 'GHL API error: ' + ghlResponse.status, details: error }),
                { status: 500, headers: corsHeaders }
            );
        }

        const result = await ghlResponse.json();
        
        return new Response(
            JSON.stringify({ success: true, contactId: result.contact?.id }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error('Function error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
