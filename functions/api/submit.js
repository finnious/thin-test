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

        const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.GHL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
                JSON.stringify({ success: false, error: 'GHL API error: ' + ghlResponse.status }),
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
